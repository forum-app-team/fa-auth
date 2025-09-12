import jwt from 'jsonwebtoken';

import AuthError from '../utils/error.js';

const authenticateIdentity = (req, _res, next) => {
    try{
        const authHearder = req.headers["authorization"];
        if (!authHearder) {
        throw new AuthError("Access token not provided", 401)
        }

        const accessToken = authHearder.split(" ")[1];
        console.log("Access Token Retrived: \n", accessToken);

        if (!accessToken) {
            throw new AuthError("Invalid authorization header", 401);
        }
        
        let payload;
        try {
            payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        } catch (error) {
            throw new AuthError("Invalid or expired Access token", 401)
        }
        if (!payload) {
            throw new AuthError("Invalid or expired access token", 401);
        }

        req.currUser = {
            userId: payload.sub,
            role: payload.role,
            email: payload.email
        };

        next();

    } catch(error) {
        next(error);
    }
}

export default authenticateIdentity;