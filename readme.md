# Auth Microservice

A authentication microservice built with Node.js and Express. It handles user registration, login, and JWT-based session management.

## Features
+ **User Authentication**
    - Secure login / Logout with JWT
    - Registration with hashed password storage (Argon 2)
+ **User Identity Management**
    - Update credentials (email, password)
+ **Access Control**
  - Account deactivation check
  - Email verification flag included in tokens
+ **Error Handling**
    - Consistent error objects with proper HTTP status codes and messages

## API Endpoints
```
| Method | Endpoint           | Description                            | Auth Required | Body Parameters                                           |
| ------ | ------------------ | -------------------------------------- | ------------- | --------------------------------------------------------- |
| POST   | /api/auth/register | Register a new user                    | No            | `email`, `password`, `firstName`, `lastName`              |
| POST   | /api/auth/login    | Logs in a user and returns a JWT token | No            | `email`, `password`                                       |
| GET    | /api/auth/logout   | Logs out a user                        | Yes           |  None                                                     |
| PUT    | /api/auth/identity | Update email/password                  | Yes           | `currentPassword` (required), `newPassword?`, `newEmail?` |
```
* At least one of `newPassword`, `newEmail` should be provided when calling `PUT /api/auth/identity`

## Model & JWT Payload
### Identity Model
The `Identity` model represents a user’s authentication and identity information. It is defined using Sequelize ORM and stored in the `identities` table.
#### Fields
```
| Field           | Type    | Required | Default    | Description                                               |
| --------------- | ------- | -------- | ---------- | --------------------------------------------------------- |
| `id`            | UUID    | Yes      | UUIDV4     | Primary key for each identity record.                     |
| `email`         | STRING  | Yes      | —          | User email, must be *unique* and a valid email format.    |
| `passwordHash`  | STRING  | Yes      | —          | Hashed password for authentication.                       |
| `role`          | STRING  | Yes      | `'normal'` | Role of the user (e.g., normal, admin).                   |
| `isActive`      | BOOLEAN | Yes      | `true`     | Indicates whether the user account is active or banned.   |
| `emailVerified` | BOOLEAN | Yes      | `false`    | Indicates if the user's email has been verified.          |
```

### JWT Token Payload
When issuing a JWT token for authentication, the following payload is used:
```js
// const identity = await Identity.findOne({ where: { email } });
const payload = {
    sub: identity.id,          // User ID
    role: identity.role,       // User role
    emailVerified: identity.emailVerified // Whether the user's email is verified
};
```
+ sub: Subject of the token, set to the user’s unique id.
+ role: See the fields above.
+ emailVerified: see the fields above.


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
+ Prerequisites: 
    - Node.js (v22 recommended)
    - A running MySQL Database (or your DB of choice), with credentials stored in `.env`
    - [Optional] Docker
+ Clone this repository
+ Run `npm install`

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
To initialize the database for local development and testing, follow the following steps:
```bash
$ cd src
$ npx sequelize-cli init
$ npx sequelize-cli db:migrate --config config/config.js
```

## Pending Work
+ Global Error Handling (DONE)
+ Send user profile message to Rabbit MQ (Pending)
+ Add refresh token (Pending)
+ implement user logout (DONE)
+ Implement password management (DONE)

## Placeholders
### `src/services/AuthServices.js`
+ At `registerUser()`: Sending user profile data to Rabbit MQ -> User service
+ At `registerUser()`: Sending user email to Rabbit MQ -> Email Service (initial email verification)
+ At `updateUserIdentity()`: Sending updated email address to Rabbit MQ -> Email service for verification