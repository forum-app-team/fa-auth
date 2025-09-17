import amqp from "amqplib";
import { Op } from "sequelize";

import Identity from "../models/Identity.js";
import EmailToken from "../models/EmailToken.js";
import {genEmailVerificationToken} from "../utils/EmailVerificationUtils.js";
import AuthError from "../utils/error.js";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const RABBITMQ_EMAIL_EXCHANGE = process.env.RABBITMQ_EMAIL_EXCHANGE;
const RABBITMQ_EMAIL_EXCHANGE_TYPE = process.env.RABBITMQ_EMAIL_EXCHANGE_TYPE;
const RABBITMQ_EMAIL_ROUTING_KEY = process.env.RABBITMQ_EMAIL_ROUTING_KEY;

const BASE_URL = process.env.BASE_URL;

const sendVerificationEmail = async (userId, email) => {
    if (!userId || !email) {
        throw new AuthError("User ID and Email required", 400);
    }

    const identity = await Identity.findByPk(userId);

    // if (identity.emailVerified) {
    //     throw new AuthError("Email already verified", 409);
    // }
    // connect to Rabbit MQ
    const conn = await amqp.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();

    await ch.assertExchange(
        RABBITMQ_EMAIL_EXCHANGE,
        RABBITMQ_EMAIL_EXCHANGE_TYPE,
        {
            durable: true
        }
    );

    await ch.assertQueue(
        `${RABBITMQ_EMAIL_EXCHANGE}.${RABBITMQ_EMAIL_ROUTING_KEY}`, 
        { 
            durable: true 
        });
        
    await ch.bindQueue(
        `${RABBITMQ_EMAIL_EXCHANGE}.${RABBITMQ_EMAIL_ROUTING_KEY}`,
        RABBITMQ_EMAIL_EXCHANGE,
        RABBITMQ_EMAIL_ROUTING_KEY
    );

    // prepare the verification link
    let token, tokenAlreadyExists;
    do {
        token = genEmailVerificationToken();
        tokenAlreadyExists = await EmailToken.findOne({where: {token}});
    } while (tokenAlreadyExists);

    try {
        await EmailToken.create({userId, token, to: email});
    } catch(error) {
        throw new AuthError("Unexpected error during token creation", 500)
    }

    const link = `${BASE_URL}/verify-email?token=${token}`;

    const payload = {
        to: email,
        subject: 'Forum App -- Email Verification Link',
        html: `
            <div>
                <p>Please click the link below to complete email verification. The link expires in 30 minutes.</p>
                <a href=${link}>${link}</a>
            </div>
            `
    };

    // send out the payload
    const msg = JSON.stringify(payload);
    ch.publish(RABBITMQ_EMAIL_EXCHANGE, RABBITMQ_EMAIL_ROUTING_KEY, Buffer.from(msg));

    console.log(" [x] Sent verification Email %s", msg);
    return {payload, link, token};
};

const validateVerificationEmail = async (tokenString) => {
    if (!tokenString) {
        throw new AuthError("No verification token provided", 400);
    }
    
    `Look up token in the db. If
        - Cannot found token
        - Token already used
        - Token expired
        - A newer token exists for the same user ID
    The service will throw 401.
    `
    const token = await EmailToken.findOne({
        where: {token: tokenString}
    });

    const newerToken = await EmailToken.findOne({
        where: {
            userId: token.userId,
            createdAt: {[Op.gt]: token.createdAt}
        },
        order: [["createdAt", "DESC"]]
    });

    if (!token || token.expiresAt < new Date()) {
        throw new AuthError("Invalid or expired token", 401);
    }
    if (token.used || token.usedAt) {
        throw new AuthError("Token already used", 401);
    }

    if (newerToken) {
        throw new AuthError("Stale token", 409);
    }

    const identity = await Identity.findByPk(token.userId);
    // what if the user is not found?
    if (!identity) {
        throw new AuthError("User not found", 404);
    }

    // if (identity.emailVerified) {
    //     throw new AuthError("Email already verified", 409);
    // }

    try {
        // set identity.emailVerified to true
        // set new email only after verification
        await identity.update({
            email: token.to, 
            emailVerified: true
        });

        // mark token as used
        await token.update({used: true, usedAt: new Date()});
    } catch(error) {
        throw new AuthError("Unexpected error when saving data", 500);
    }

    return {email: identity.email};
    
};

export {sendVerificationEmail, validateVerificationEmail};