import {json} from "express";
import * as argon2 from 'argon2';

import Identity from '../models/Identity';
import genToken from '../utils/genToken';
import { where } from "sequelize";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
// const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const registerUser = async ({email, password, firstName, lastName}) => {
    try {
        const existingIdentity = await Identity.findOne({where: {email}});
        if (existingIdentity) {
            throw new Error('Email address already in use');
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

        // await publishEvent(eventPayload); // placeholder for Rabbit MQ

        return newIdentity;

    } catch(error) {
        console.log(error);
    }
};

export const loginUser = async (email, password) => {
    try {
        const identity = await Identity.findOne({where: {email}});
        if (!identity) {
            throw new Error("Invalid credentials");
        }
        if (!identity.isActive) {
            throw new Error("Account deactivated, please contact admins");
        }

        const isPwdCorrect = await argon2.verify(identity.passwordHash, password);
        if (isPwdCorrect) {
            throw new Error("Invalid credentials");
        }

        const payload = {sub: identity.id, role: identity.role};
        const accessToken = genToken(payload, ACCESS_SECRET, "60m");
        // const refreshToken = genToken({sub: identity.id}, REFRESH_SECRET, "7d");

        return {accessToken};

    } catch(error) {
        console.log(error);
    }
}

export const logoutUser = async () => {};