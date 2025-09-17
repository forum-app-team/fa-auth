import crypto from 'crypto';

const EMAIL_TOKEN_SIZE = process.env.EMAIL_TOKEN_SIZE;

const genEmailVerificationToken = () => {
    return crypto.randomBytes(parseInt(EMAIL_TOKEN_SIZE) || 32).toString("hex");
};


export { genEmailVerificationToken };
