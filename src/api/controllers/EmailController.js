import { 
    sendVerificationEmail, 
    validateVerificationEmail 
} from "../../services/EmailVerificationService";

const postSendVerificationEmail = async (req, res, next) => {
    `This API is hit when 
        - User changes email address
        - Anytime a verification email is resent
    In any of these cases, the user is already LOGGED in, and we can extract
    user ID and email address from req.currUser thanks to the middleware.
    `
    try {
        const {userId, email} = req.currUser || {};
        const {link} = await sendVerificationEmail(userId, email);

        return res.status(200).json({message: "Successfully sent verification email", link});

    } catch(error) {
        next(error);
    }
};

const getVerifyEmail = async (req, res, next) => {
    `Apparently, this API should not require login.
    Incoming request format:
        '/api/auth/verify-email?token=<token>'
    `
    try {
        const tokenString = req.query.token || "";
        const {email} = await validateVerificationEmail(tokenString);
        return res.status(200).json({message: "Successfully verified email address", email});

    } catch(error) {
        next(error);
    }
};

export {postSendVerificationEmail, getVerifyEmail};