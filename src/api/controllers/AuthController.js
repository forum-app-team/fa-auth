// import {json} from "express";
// import * as argon2 from 'argon2';

// import Identity from '../../models/Identity';
// import genToken from '../../utils/genToken';
import { registerUser, loginUser, updateUserIdentity } from "../../services/AuthService.js";


const postUserRegister = async (req, res, next) => {
    try {
        const {email, password, firstName, lastName} = req.body || {};
        const newIdentity = await registerUser(email, password, firstName, lastName);
        return res.status(201).json({message: "Successfully creted new user"});
    } catch(error) {
        next(error);
    }
};

const postUserLogin = async (req, res, next) => {
    try {
        const {email, password} = req.body || {};
        const {accessToken} = await loginUser(email, password);
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 60 * 60 * 1000});

        return res.status(200).json({message: "Successfully signed in"});

    } catch(error) {
        next(error);
    }
}

const getUserLogout = async (_req, res, next) => {
    try {
        res.clearCookie("accessToken");
        return res.status(200).json({message: "Successfully logged out"});
    } catch(error) {
        next(error);
    }
};

const putUserIdentity = async (req, res, next) => {
    try {
        const {currentPassword, newPassword, newEmail} = req.body || {};
        const userId = req.currUser.userId || null;
        const updates = await updateUserIdentity(userId, currentPassword, newPassword, newEmail);
        return res.status(200).json({message: "Successfully updated Identity", details: updates});
    } catch(error) {
        next(error);
    }
};

export {postUserRegister, postUserLogin, getUserLogout, putUserIdentity};