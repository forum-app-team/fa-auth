import * as argon2 from 'argon2';

import Identity from '../models/Identity.js';
import genToken from '../utils/genToken.js';
import verifyPassword from '../utils/verifyPwd.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
// const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const registerUser = async ({email, password, firstName, lastName}) => {
    try {
        const existingIdentity = await Identity.findOne({where: {email}});
        if (existingIdentity) {
            throw new Error('Email address already in use by another account');
        }
        const passwordHash = await argon2.hash(password);
        const newIdentity = await Identity.create({email, passwordHash});

        const eventPayload = {
            userId: newIdentity.id,
            firstName: firstName,
            lastName: lastName,
            dateJoined: new Date(),
            // placeholder for profile image
        }

        // await publishEvent(eventPayload); // placeholder: send profile data to Rabbit MQ
        console.log("Message that should be sent to Rabbit MQ:", eventPayload)

        // placeholder: send email address to Rabbit MQ (So that new users can complete the
        // email verification later on)

        return newIdentity;

    } catch(error) {
        console.log(error);
    }
};

export const loginUser = async ({email, password}) => {
    try {
        const identity = await Identity.findOne({where: {email}});
        if (!identity) {
            throw new Error("Invalid credentials: email address not found"); // dev env only
        }
        if (!identity.isActive) {
            throw new Error("Account deactivated, please contact admins");
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

        return {accessToken};

    } catch(error) {
        console.log("Error caught: \n", error);
    }
};

export const updateUserIdentity = async (userId, {currentPassword, newPassword, newEmail}) => {
    try {
        if (!newPassword && !newEmail) {
            throw new Error("No new credentials provided");
        }
        const identity = await Identity.findByPk(userId);
        if (!identity) {
            throw new Error("User not found");
        }
        // const isPwdCorrect = await argon2.verify(identity.passwordHash, password);
        // if (!isPwdCorrect) {
        //     throw new Error("Invalid credentials: incorrect password");
        // }
        await verifyPassword(identity.passwordHash, currentPassword);
        
        const updates = {};
        
        if (newPassword) {
            identity.passwordHash = await argon2.hash(newPassword);
            updates.passwordUpdated = true;
        }

        if (newEmail) {
            if (newEmail === identity.email) {
                throw new Error("The new email cannot be the same as your current one");
            }
            const existingIdentity = await Identity.findOne({where: {email: newEmail}});
            if (existingIdentity) {
                throw new Error("Email address already in use by another account");
            }

            `placeholder: Message -> Broker -> Email service`
            // sendVerificationEmail(newEmail);
            // updates.emailChangeInitiated = true;

            // for now, simply update the email in order to test the functionalities
            identity.email = newEmail;
        }

        await identity.save();
        return updates;

    } catch(error) {
        console.log(error);

    }
};