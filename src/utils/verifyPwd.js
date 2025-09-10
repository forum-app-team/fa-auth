import * as argon2 from 'argon2';

const verifyPassword = async (passwordHash, candidatePassword) => {
    const isPwdCorrect = await argon2.verify(passwordHash, candidatePassword);
    if (!isPwdCorrect) {
        throw new Error("Invalid credentials: incorrect password");
    }
};

export default verifyPassword;