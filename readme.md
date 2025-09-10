# Auth Microservice

A authentication microservice built with Node.js and Express. It handles user registration, login, and JWT-based session management.

## Features

## API Endpoints

| Method | Endpoint             | Description                                 |
|--------|----------------------|---------------------------------------------|
| POST   | /api/auth/register   | Register a new user                         | 
| POST   | /api/auth/login      | Logs in a user and returns a JWT token      |
| GET    | /api/auth/logout     | Logs out a user                             |
| PUT    | /api/auth/identity   | Updates user email address and/or password  |

## Project Structure
```
fa-auth/
├── app.js
├── index.js
├── package-lock.json
├── package.json
├── readme.md
└── src/
    ├── api/
    │   ├── controllers/
    │   │   └── AuthController.js
    │   └── routers/
    │       └── AuthRouter.js
    ├── config/
    │   ├── config.js
    │   └── connections.js
    ├── middlewares/
    │   ├── ErrorHandler.js
    │   └── ParseIDMiddleware.js
    ├── migrations/
    ├── models/
    │   └── Identity.js
    ├── seeders/
    ├── services/
    │   └── AuthService.js
    └── utils/
        ├── error.js
        ├── genToken.js
        └── verifyPwd.js
```

## Getting Started
+ Prerequisites
+ Clone the repo
+ Install dependencies

## Configuration
### `.env`
+ Create a `.env` file locally with the following variables:
```
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=5001
DATABASE_NAME=forum_app
DATABASE_SOCKET=/tmp/mysql.sock
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=localhost
```

### Database

```bash
$ cd src
$ npx sequelize-cli init
$ npx sequelize-cli db:migrate --config config/config.js
```


## Pending Work
+ Global Error Handling
+ Send user profile message to Rabbit MQ
+ Add refresh token
+ implement user logout
+ Implement password management

## Placeholders
### `src/services/AuthServices.js`
+ At `registerUser()`: Sending user profile data to Rabbit MQ -> User service
+ At `registerUser()`: Sending user email to Rabbit MQ -> Email Service (initial email verification)
+ At `updateUserIdentity()`: Sending updated email address to Rabbit MQ -> Email service for verification