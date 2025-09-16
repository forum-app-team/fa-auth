# Auth Microservice

A authentication microservice built with Node.js and Express. It handles user registration, login, and JWT-based session management.

## Latest Update
+ To start the Rabbit MQ Message Consumer for Failed user creations, run `npm run worker`
+ Still need to add the consumer for email verification

## Features
### Authentication
+ User Registration

  Create a new user account with email, password, and profile details (firstName, lastName).

+ User Login

  Log in the user with email, password, and issue an access token for frontend use. A refresh token is stored in an HTTP-only cookie.

+ User Logout

  Log out the user and clear the refresh token cookie.

+ Refresh Access Token
  
  Generate a new access token using the refresh token stored in cookies.

### User Management
+ Get Current User Identity

  Retrieve the authenticated user’s identity, including id, email, role, and emailVerified status.

+ Update User Identity
  
  Update user information such as email or password. Returns a new access token after update.

## API Endpoints
### List of Endpoints

| Method | Endpoint                 | Description                            | Auth Required | Body Parameters                                           |
| ------ | ------------------------ | -------------------------------------- | ------------- | --------------------------------------------------------- |
| POST   | /api/auth/register       | Register a new user                    | No            | `email`, `password`, `firstName`, `lastName`              |
| POST   | /api/auth/login          | Logs in a user and returns a JWT token | No            | `email`, `password`                                       |
| GET    | /api/auth/logout         | Logs out a user                        | Yes           |  None                                                     |
| GET    | /api/auth/identity       | Retrieve access token payload          | Yes           |  None                                                     |
| PUT    | /api/auth/identity       | Update email/password                  | Yes           | `currentPassword` (required), `newPassword?`, `newEmail?` |
| POST   | /api/auth/refresh        | Refresh the access token               | No            | `None`                                                    |
| GET    | /api/auth/test_protected | A protected page for API tests         | Yes           | `None`                                                    |
| POST   | /api/auth/test_protected | A protected page for API tests         | Yes           | The API returns the request body itself under `content`.  |

* At least one of `newPassword`, `newEmail` should be provided when calling `PUT /api/auth/identity`

### Responses

| Method | Endpoint                 | Success Status | Response Body                                                                                   |
| ------ | ------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |
| POST   | /api/auth/register       | 201            | `{ "message": "Successfully created new user" }`                                                |
| POST   | /api/auth/login          | 200            | `{ "message": "Successfully signed in", "accessToken": "<token>" }`                             |
| GET    | /api/auth/logout         | 200            | `{ "message": "Successfully logged out" }`                                                      |
| GET    | /api/auth/identity       | 200            | `{ "message": "Successfully retrieved identity", "identity": <token payload> }`                 |
| PUT    | /api/auth/identity       | 200            | `{ "message": "Successfully updated identity", "details": updates, "accessToken": <token> }`    |
| POST   | /api/auth/refresh        | 200            | `{ "message": "Successfully refreshed access token", "accessToken": <token> }`                  |
| GET    | /api/auth/test_protected | 200            | `{ "message": "Test successful" }`                                                              |
| POST   | /api/auth/test_protected | 200            | `{ "message": "Test successful", "content": req.body }`                                         |

### Error Codes
The API returns standard HTTP status codes to indicate the outcome of requests. Below is a summary of the main codes used:
| Code   | Status                | Description / Scenario                                                                                             |
| ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 400    | Bad Request           | Missing required fields, no new credentials provided, or invalid input (e.g., new password/email same as current). |
| 401    | Unauthorized          | Invalid credentials, missing/invalid/expired access token or refresh token.                                        |
| 403    | Forbidden             | Authenticated but not allowed to perform the action (e.g., deactivated account).                                   |
| 404    | Not Found             | User or resource not found.                                                                                        |
| 409    | Conflict              | Attempt to create or update a resource that would cause a conflict (e.g., email already in use).                   |
| 500    | Internal Server Error | Unexpected server errors during processing or saving data.                                                         |


### Fetching from the Front End
The access token is now stored **in the Authorization header** instead of the cookies. You can obtain an access token from the `/login` endpoint or the newly added `/refresh` endpoint. Below are some minimal examples of fetching the protected endpoints from the front end:

+ Using `fetch`
```js
// Assuming you have a valid accessToken stored
const accessToken = "YOUR_ACCESS_TOKEN";
const body = {
  "email": "user@example.com",
  "password": "password123"
}

fetch("http://localhost:3000/api/test_protected", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  credentials: "include" // to include refresh tokens

  body: JSON.stringify(body) // if applicable
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

+ Using `axios`
```js
import axios from 'axios';

axios.post("http://localhost:3000/api/test_protected", 
  body, // if applicable
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    withCredentials: true // to include refresh tokens
  }
)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```


## Model & JWT Payload
### Identity Model
The `Identity` model represents a user’s authentication and identity information. It is defined using Sequelize ORM and stored in the `identities` table.
#### Fields

| Field           | Type    | Required | Default    | Description                                               |
| --------------- | ------- | -------- | ---------- | --------------------------------------------------------- |
| `id`            | UUID    | Yes      | UUIDV4     | Primary key for each identity record.                     |
| `email`         | STRING  | Yes      | —          | User email, must be *unique* and a valid email format.    |
| `passwordHash`  | STRING  | Yes      | —          | Hashed password for authentication.                       |
| `role`          | STRING  | Yes      | `'normal'` | Role of the user (e.g., normal, admin).                   |
| `isActive`      | BOOLEAN | Yes      | `true`     | Indicates whether the user account is active or banned.   |
| `emailVerified` | BOOLEAN | Yes      | `false`    | Indicates if the user's email has been verified.          |


### JWT Token Payload
When issuing a JWT token for authentication, the following payload is used:
```js
// const identity = await Identity.findOne({ where: { email } });
const payload = {
    sub: identity.id,          // User ID
    email: identity.email,     // User Email
    role: identity.role,       // User role
    emailVerified: identity.emailVerified // Whether the user's email is verified
};
```
+ sub: Subject of the token, set to the user’s unique id.
+ role: See the fields above.
+ emailVerified: see the fields above.

**UPDATE** If you would like to modify the payload for local development or testing, it's located at `src/utils/genAccessTokenPayload.js`. 
For permanent changes, please create a new PR. 

## Project Structure
```
fa-auth/
├── app.js
├── index.js
├── package-lock.json
├── package.json
├── readme.md
├── .env
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
    │   ├── AuthMiddleware.js    
    │   ├── ErrorHandler.js
    │   └── ValidateInputMiddleware.js
    ├── migrations/
    ├── models/
    │   └── Identity.js
    ├── seeders/
    ├── services/
    │   └── AuthService.js
    └── utils/
        ├── error.js
        ├── genAccessTokenPayload.js
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
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

PORT=5001

DATABASE_NAME=forum_app
DATABASE_SOCKET=/tmp/mysql.sock
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=localhost
```
+ A demo `.env` file can also be found in `.env.example`.

### Database
To initialize the database for local development and testing, follow the following steps:
```bash
$ cd src
$ npx sequelize-cli init
$ npx sequelize-cli db:migrate --config config/config.js
```

## Pending Work
+ Add a table for refresh tokens to the DB

## Placeholders
### `src/services/AuthServices.js`
+ At `registerUser()`: Sending user profile data to Rabbit MQ -> User service
+ At `registerUser()`: Sending user email to Rabbit MQ -> Email Service (initial email verification)
+ At `updateUserIdentity()`: Sending updated email address to Rabbit MQ -> Email service for verification
