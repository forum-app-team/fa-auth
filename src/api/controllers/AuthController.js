// import {json} from "express";
// import * as argon2 from 'argon2';

// import Identity from '../../models/Identity';
// import genToken from '../../utils/genToken';
import { 
    registerUser, 
    loginUser, 
    updateUserIdentity, 
    refreshAccessToken
} from "../../services/AuthService.js";

import publishUserCreated from "../../services/PublisherService.js";


const postUserRegister = async (req, res, next) => {
    try {
        const {email, password, firstName, lastName} = req.body || {};
        const {newIdentity, payload} = await registerUser(email, password, firstName, lastName);

        await publishUserCreated(payload);

        return res.status(201).json({message: "Successfully creted new user"});
    } catch(error) {
        next(error);
    }
};

const postUserLogin = async (req, res, next) => {
    try {
        const {email, password} = req.body || {};
        const {accessToken, refreshToken} = await loginUser(email, password);
        res.cookie("refreshToken", refreshToken, {httpOnly: true, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000});

        return res.status(200).json({message: "Successfully signed in", accessToken});

    } catch(error) {
        next(error);
    }
}

const getUserLogout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            // await invalidateRefreshToken(refreshToken) // DB placeholder
            console.log("");
        }

        res.clearCookie("refreshToken");
        return res.status(200).json({message: "Successfully logged out"});
    } catch(error) {
        next(error);
    }
};

const getUserIdentity = async (req, res, next) => {
    try {
        return res.status(200).json({
            message: "Successfully retrieved identity", 
            identity: req.currUser
        });
    } catch(error) {
        next(error);
    }
}

const putUserIdentity = async (req, res, next) => {
    try {
        const {currentPassword, newPassword, newEmail} = req.body || {};
        const userId = req.currUser.userId || null;
        const {updates, newAccessToken} = await updateUserIdentity(userId, currentPassword, newPassword, newEmail);
        return res.status(200).json({
            message: "Successfully updated identity", 
            details: updates, 
            accessToken: newAccessToken
        });
    } catch(error) {
        next(error);
    }
};

const postRefreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const newAccessToken = await refreshAccessToken(refreshToken);
        return res.status(200).json({
            message: "Successfully refreshed access token", 
            accessToken: newAccessToken
        });
    } catch(error) {
        next(error);
    }
};

const getTestProtectedPage = async (_req, res, next) => {
    try {
        return res.status(200).json({message: "Test successful"});
    } catch(error) {
        next(error);
    }
};

const postTestProtectedPage = async (req, res, next) => {
    try {
        return res.status(200).json({message: "Test succesful", content: req.body});
    } catch(error) {
        next(error);
    }
};

export {
    postUserRegister, 
    postUserLogin, 
    getUserLogout, 
    getUserIdentity, 
    putUserIdentity, 
    postRefreshAccessToken, 
    getTestProtectedPage, 
    postTestProtectedPage
};