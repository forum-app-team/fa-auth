import express from 'express';

import authenticateIdentity from '../../middlewares/AuthMiddleware';

import { postSendVerificationEmail, getVerifyEmail } from '../controllers/EmailController';

const EmailRouter = express.Router();

EmailRouter
    .post("/verify-email", authenticateIdentity, postSendVerificationEmail)
    .get('/verify-email', getVerifyEmail)
;

export default EmailRouter;