import validator from "validator";
import AuthError from "../utils/error.js";


const validateInput = (requiredFields = []) => {
    return (req, _res, next) => {
        const data = req.body || {};
        const errors = {};

        for (const [key, value] of Object.entries(data)) {
            if (typeof value !== "string") {
                req.body[key] = "";
                errors[key] = `${key} must be a string`;
                continue;
            }

            const trimmedValue = key.toLowerCase().includes("email")
                ? value.trim().toLowerCase()
                : value.trim();

            req.body[key] = trimmedValue;

            if (requiredFields.includes(key) && !trimmedValue) {
                errors[key] = `${key} is required`;
                continue;
            }

            if (key.toLowerCase().includes("email") && trimmedValue && !validator.isEmail(trimmedValue)) {
                errors[key] = "Invalid Email Address";
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new AuthError("Validation failed", 400, Object.values(errors)[0]);
        }

        next();
    };
};

export default validateInput;
