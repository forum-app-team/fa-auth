import { Sequelize } from "sequelize";

const {
    DATABASE_NAME,
    DATABASE_SOCKET,
    DATABASE_USER,
    DATABASE_PASSWORD,
} = process.env;

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD,
    { dialect: 'mysql', dialectOptions: { socketPath: DATABASE_SOCKET } }
);

try {
    await sequelize.authenticate();
    console.log("Successfully established DB connections");
} catch(e) {
    console.error("Unable to connect to DB:", e)
}

export default sequelize;