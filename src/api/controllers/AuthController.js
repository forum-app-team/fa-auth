// import {json} from "express";
// import * as argon2 from 'argon2';

// import Identity from '../../models/Identity';
// import genToken from '../../utils/genToken';
import { registerUser, loginUser, updateUserIdentity } from "../../services/AuthService.js";


const postUserRegister = async (req, res) => {
    try {
        const newIdentity = await registerUser(req.body);
        return res.status(201).json({id: newIdentity.id, email: newIdentity.email});
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
};

const postUserLogin = async (req, res) => {
    try {
        const {accessToken} = await loginUser(req.body);
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 60 * 60 * 1000});

        return res.status(200).json({message: "Successfully signed in"});

    } catch(error) {
        console.log("Error caught: \n", error);
        return res.status(500).json({message: error})
    }
}

const getUserLogout = async (_req, res, next) => {
    try {
        res.clearCookie("accessToken");
        return res.status(200).json({message: "Successfully logged out"});
    } catch(error) {
        // res.status(500).json({message: error})
        next(error);
    }
};

const putUserIdentity = async (req, res, next) => {
    try {
        const updates = await updateUserIdentity(req.currUser.userId, req.body);
        return res.status(200).json({message: "Successfully updated Identity"});
    } catch(error) {
        next(error);
    }
};

export {postUserRegister, postUserLogin, getUserLogout, putUserIdentity};