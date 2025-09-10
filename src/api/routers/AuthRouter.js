import express from 'express';

import parseIdentity from '../../middlewares/ParseIDMiddleware.js';
import { 
    postUserRegister, 
    postUserLogin, 
    getUserLogout,
    putUserIdentity } from '../controllers/AuthController.js';

const AuthRouter = express.Router()

AuthRouter
    .post("/register", postUserRegister)
    .post("/login", postUserLogin)
    .get("/logout", getUserLogout)
    .put("/identity", parseIdentity, putUserIdentity);

export default AuthRouter;
