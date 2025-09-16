import crypto from 'crypto';

const EMAIL_TOKEN_SIZE = process.env.EMAIL_TOKEN_SIZE;

const genEmailVerificationToken = async () => {
    return crypto.randomBytes(EMAIL_TOKEN_SIZE || 32).toString("hex");
};


export { genEmailVerificationToken };
