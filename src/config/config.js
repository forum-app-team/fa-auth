import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../.env') });


const {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
  DATABASE_SOCKET,
} = process.env;


export default {
  development: {
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    host: DATABASE_HOST || '127.0.0.1',
    dialect: 'mysql',
    dialectOptions: {
      socketPath: DATABASE_SOCKET || undefined,
    },
  },
//   test: {
//     username: DATABASE_USER,
//     password: DATABASE_PASSWORD,
//     database: `${DATABASE_NAME}_test`,
//     host: DATABASE_HOST || '127.0.0.1',
//     dialect: 'mysql',
//   },
//   production: {
//     username: DATABASE_USER,
//     password: DATABASE_PASSWORD,
//     database: DATABASE_NAME,
//     host: DATABASE_HOST,
//     dialect: 'mysql',
//   },
};
