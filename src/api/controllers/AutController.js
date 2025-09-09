// import {json} from "express";
// import * as argon2 from 'argon2';

// import Identity from '../../models/Identity';
// import genToken from '../../utils/genToken';
import { registerUser, loginUser } from "../../services/AuthService.js";


const postUserRegister = async (req, res) => {
    try {
        const newIdentity = await registerUser(req.body);
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: error})
    }
};

const postUserLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        const {accessToken} = await loginUser(email, password);
        res.cookie("accessToken", accessToken, {httpOnly: true, maxAge: 60 * 60 * 1000});

        return res.status(200).json({message: "Successfully signed in"});

    } catch(error) {
        console.log("Error caught: \n", error);
        return res.status(500).json({message: error})
    }
}

const getUserLogout = async (req, res) => {};

export {postUserRegister, postUserLogin, getUserLogout};