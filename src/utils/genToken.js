import jwt from "jsonwebtoken";

const genToken = (payload, secret, expire) => {
    const token = jwt.sign(
        payload,
        secret,
        {expiresIn: expire}
    );
    return token;
}

export default genToken;
