import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import Identity from '../models/Identity.js';
import genToken from '../utils/genToken.js';
import genPayload from '../utils/genAccessTokenPayload.js';
import verifyPassword from '../utils/verifyPwd.js';
import AuthError from '../utils/error.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE;

export const registerUser = async (email, password, firstName, lastName) => {
    if (!email || !password || !firstName || !lastName) {
        throw new AuthError("Missing required registration fields", 400);
        
    }
    const existingIdentity = await Identity.findOne({ where: { email } });
    if (existingIdentity) {
        // throw new Error('Email address already in use by another account');
        throw new AuthError("Email address already in use by another account", 409); // conflicts
    }
    const passwordHash = await argon2.hash(password);
    const newIdentity = await Identity.create({ email, passwordHash });

    const eventPayload = {
        userId: newIdentity.id,
        firstName: firstName,
        lastName: lastName,
        dateJoined: new Date(),
    }

    // await publishEvent(eventPayload); // placeholder: send profile data to Rabbit MQ
    console.log("Message that should be sent to Rabbit MQ:", eventPayload)

    // placeholder: send email address to Rabbit MQ (So that new users can complete the
    // email verification later on)

    return newIdentity;
};

export const loginUser = async (email, password) => {
    if (!email || !password) {
        throw new AuthError("Email and password are required", 400);
    }
    const identity = await Identity.findOne({ where: { email } });
    if (!identity) {
        throw new AuthError("Invalid credentials: email address not found", 401);
    }
    if (!identity.isActive) {
        // throw new Error("Account deactivated, please contact admins");
        throw new AuthError("Account deactivated, please contact admins", 403);
    } // block deactivated (banned) accounts


    await verifyPassword(identity.passwordHash, password);

    // const payload = {
    //     sub: identity.id,
    //     role: identity.role,
    //     emailVerified: identity.emailVerified
    // };

    const payload = genPayload(identity);

    const accessToken = genToken(payload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRE);
    const refreshToken = genToken({sub: identity.id}, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRE);

    // await saveRefreshToken(identity.id, refreshToken); // plcaeholder for Refresh Token DB

    return { accessToken, refreshToken };

};

export const updateUserIdentity = async (userId, currentPassword, newPassword, newEmail) => {
    if (!userId) {
        throw new AuthError("No User ID provided", 400);
    }
    if (!newPassword && !newEmail) {
        throw new AuthError("No new credentials provided", 400); // bad request
    }
    const identity = await Identity.findByPk(userId);
    if (!identity) {
        throw new AuthError("User not found", 404);
    }

    await verifyPassword(identity.passwordHash, currentPassword);

    const updates = {};

    if (newPassword) {
        if (await argon2.verify(identity.passwordHash, newPassword)) {
            throw new AuthError("New password cannot be the same as your current one", 400);
        }
        identity.passwordHash = await argon2.hash(newPassword);
        updates.passwordUpdated = true;
    }

    if (newEmail) {
        if (newEmail === identity.email) {
            throw new AuthError("New email cannot be the same as your current one", 400);
        }
        const existingIdentity = await Identity.findOne({ where: { email: newEmail } });
        if (existingIdentity) {
            throw new AuthError("Email already in use by another account", 409); 
        }

        `placeholder: Message -> Broker -> Email service`
        // sendVerificationEmail(newEmail);
        // updates.emailChangeInitiated = true;

        // for now, simply update the email in order to test the functionalities
        identity.email = newEmail;
    }

    try {
        await identity.save();
    } catch(error) {
        throw new AuthError("Internal server error", 500);
    }

    // don't forget to sign a new access token
    const payload = genPayload(identity);
    const newAccessToken = genToken(payload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRE);
    return {updates, newAccessToken};

};

export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new AuthError("No refresh token provided", 401);
    }

    //placeholder for DB
    // const isValid = await isRefreshTokenValid(refreshToken); 
    // if (!isValid) {
    //     throw new AuthError("Invalid refresh token", 401);
    // }

    let refreshPayload;
    try {
        refreshPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch(error) {
        throw new AuthError("Invalid or expired refresh token", 401);
    }
    const identity = await Identity.findByPk(refreshPayload.sub);
    if (!identity) {
        throw new AuthError("User not found", 404);
    }

    const accessPayload = genPayload(identity);

    const newAccessToken = genToken(accessPayload, JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRE);
    return newAccessToken;

};