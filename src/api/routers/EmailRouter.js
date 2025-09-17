import express from 'express';

import authenticateIdentity from '../../middlewares/AuthMiddleware.js';

import { postSendVerificationEmail, postValidateEmailByLink } from '../controllers/EmailController.js';

const EmailRouter = express.Router();

EmailRouter
    .post("/send", authenticateIdentity, postSendVerificationEmail)
    .post('/verify', postValidateEmailByLink)
;

export default EmailRouter;