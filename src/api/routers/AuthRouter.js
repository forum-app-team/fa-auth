import express from 'express';

import { 
    postUserRegister, 
    postUserLogin, 
    getUserLogout } from '../controllers/AutController.js';

const AuthRouter = express.Router()

AuthRouter
    .post("/register", postUserRegister)
    .post("/login", postUserLogin)
    .get("/logout", getUserLogout);

export default AuthRouter;
