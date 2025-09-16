import express from 'express';

import authenticateIdentity from '../../middlewares/AuthMiddleware.js';
import validateInput from '../../middlewares/ValidateInputMiddleware.js';

import { 
    postUserRegister, 
    postUserLogin, 
    getUserLogout,
    getUserIdentity,
    putUserIdentity,
    postRefreshAccessToken,
    getTestProtectedPage,
    postTestProtectedPage
} from '../controllers/AuthController.js';
import AdminRouter from './AdminRouter.js';
import EmailRouter from './EmailRouter.js';

const AuthRouter = express.Router()

AuthRouter
    .post(
        "/register", 
        validateInput(["email", "password", "firstName", "lastName"]), 
        postUserRegister
    )
    .post("/login", 
        validateInput(["email", "password"]),
        postUserLogin
    )
    .get("/logout", getUserLogout)
    .get("/identity", authenticateIdentity, getUserIdentity)
    .put("/identity", 
        authenticateIdentity, 
        validateInput(["currentPassword"]),
        putUserIdentity)
    .post("/refresh", postRefreshAccessToken)
    .get("/test_protected", authenticateIdentity, getTestProtectedPage)
    .post("/test_protected", authenticateIdentity, postTestProtectedPage)
;
AuthRouter.use('/admin', AdminRouter);
AuthRouter.use(EmailRouter);

export default AuthRouter;
