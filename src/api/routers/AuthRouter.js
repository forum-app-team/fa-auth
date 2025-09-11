import express from 'express';

import authenticateIdentity from '../../middlewares/AuthMiddleware.js';
import { 
    postUserRegister, 
    postUserLogin, 
    getUserLogout,
    putUserIdentity,
    postRefreshAccessToken,
    getTestProtectedPage 
} from '../controllers/AuthController.js';

const AuthRouter = express.Router()

AuthRouter
    .post("/register", postUserRegister)
    .post("/login", postUserLogin)
    .get("/logout", getUserLogout)
    .put("/identity", authenticateIdentity, putUserIdentity)
    .post("/refresh", postRefreshAccessToken)
    .get("/test_protected", authenticateIdentity, getTestProtectedPage)
;

export default AuthRouter;
