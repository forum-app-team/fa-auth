import 'dotenv/config';
import { Sequelize } from 'sequelize';

const {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_SOCKET,
} = process.env;

// single Sequelize instance
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
  dialect: 'mysql',
  host: DATABASE_HOST,
  dialectOptions: {
    socketPath: DATABASE_SOCKET || undefined,
  },
});

export default sequelize;