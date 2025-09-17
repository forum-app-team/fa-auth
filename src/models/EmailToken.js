import { DataTypes } from "sequelize";

import sequelize from "../config/connections.js";

const EMAIL_TOKEN_EXPIRE = process.env.EMAIL_TOKEN_EXPIRE;

const EmailToken = sequelize.define("EmailToken", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: false, // a user may require multiple tokens
    },
    to: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const expireMinutes = parseInt(EMAIL_TOKEN_EXPIRE || 30, 10);
            return new Date(Date.now() + expireMinutes * 60 * 1000);
        }
    },
    usedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

}, {
    tableName: "email_tokens",
    timestamps: false,
});

export default EmailToken;