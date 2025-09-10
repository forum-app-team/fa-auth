import * as argon2 from 'argon2';

import AuthError from './error.js';

const verifyPassword = async (passwordHash, candidatePassword) => {
    const isPwdCorrect = await argon2.verify(passwordHash, candidatePassword);
    if (!isPwdCorrect) {
        throw new AuthError("Invalid credentials: incorrect password", 401);
    }
};

export default verifyPassword;