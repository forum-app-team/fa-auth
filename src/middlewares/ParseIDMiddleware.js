import jwt from 'jsonwebtoken';

import AuthError from '../utils/error.js';

const parseIdentity = (req, _res, next) => {
    try{
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new AuthError("Access token not provided", 401);
        }
        const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

        if (!payload) {
            throw new AuthError("Invalid access token", 401);
        }

        req.currUser = {
            userId: payload.sub,
            email: payload.email
        };

        next();

    } catch(error) {
        next(error);
    }
}

export default parseIdentity;