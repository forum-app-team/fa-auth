import jwt from 'jsonwebtoken';
import validator from 'validator';

const parseIdentity = (req, _res, next) => {
    try{
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new Error("Access token not provided from gateway");
        }
        const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

        if (!payload) {
            throw new Error("Invalid token");
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