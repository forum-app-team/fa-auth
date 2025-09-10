import * as argon2 from 'argon2';

import Identity from '../models/Identity.js';
import genToken from '../utils/genToken.js';
import verifyPassword from '../utils/verifyPwd.js';
import AuthError from '../utils/error.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
// const REFRESH_SECRET = process.env.REFRESH_SECRET;

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
        // throw new Error("Invalid credentials: email address not found"); // dev env only
        throw new AuthError("Invalid credentials: email address not found", 401);
    }
    if (!identity.isActive) {
        // throw new Error("Account deactivated, please contact admins");
        throw new AuthError("Account deactivated, please contact admins", 403);
    } // block deactivated (banned) accounts

    // const isPwdCorrect = await argon2.verify(identity.passwordHash, password);
    // if (!isPwdCorrect) {
    //     throw new Error("Invalid credentials: incorrect password");
    // }
    await verifyPassword(identity.passwordHash, password);

    const payload = {
        sub: identity.id,
        role: identity.role,
        emailVerified: identity.emailVerified
    };
    const accessToken = genToken(payload, JWT_ACCESS_SECRET, "60m");
    // const refreshToken = genToken({sub: identity.id}, REFRESH_SECRET, "7d");

    return { accessToken };

};

export const updateUserIdentity = async (userId, currentPassword, newPassword, newEmail) => {
    if (!userId) {
        throw new AuthError("No User ID provided", 400);
    }
    if (!newPassword && !newEmail) {
        // throw new Error("No new credentials provided");
        throw new AuthError("No new credentials provided", 400); // bad request
    }
    const identity = await Identity.findByPk(userId);
    if (!identity) {
        // throw new Error("User not found");
        throw new AuthError("User not found", 404);
    }
    // const isPwdCorrect = await argon2.verify(identity.passwordHash, password);
    // if (!isPwdCorrect) {
    //     throw new Error("Invalid credentials: incorrect password");
    // }
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
            // throw new Error("Email address already in use by another account");
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
    return updates;


};