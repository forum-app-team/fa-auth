import AuthError from '../utils/error.js';

const authorizeRoles = (...roles) => (req, res, next) => {
    try {
        if (!req.currUser)
            throw new AuthError("Authentication failed", 401);
        if (roles.length && !roles.some(r => r === req.currUser.role))
            throw new AuthError(`Access denied - requires ${roles}`, 403);
        next();
    } catch(error) {
        next(error);
    }
};

export default authorizeRoles;