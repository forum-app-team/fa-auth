# Auth Microservice

A authentication microservice built with Node.js and Express. It handles user registration, login, and JWT-based session management.

## Latest Update
+ Implemented Email Verification
+ Still need test it.

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

### Email Verification
+ Send Verification Email

  Publish a message via Rabbit MQ which causes the email service to send a verification email when a new account is created, a user changes their email,
  or a user requires a resend.

+ Validate the email verification link

  Extract the token from the request query parameters, if it's valid, mark it as used, and update the user identity accordingly.

  **Here is the verification link**: `{BASE_URL}/verify-email?token=${token}`

  For local development, `BASE_URL` is set to `http://localhost:8080`. See `.env.example`.


## API Endpoints
### List of Endpoints

#### Authentication Service

| Method | Endpoint                  | Description                            | Auth Required | Body Parameters                                           |
| ------ | ------------------------- | -------------------------------------- | ------------- | --------------------------------------------------------- |
| POST   | `/api/auth/register`      | Register a new user                    | No            | `email`, `password`, `firstName`, `lastName`              |
| POST   | `/api/auth/login`         | Logs in a user and returns a JWT token | No            | `email`, `password`                                       |
| GET    | `/api/auth/logout`        | Logs out a user                        | Yes           |  None                                                     |
| GET    | `/api/auth/identity`      | Retrieve access token payload          | Yes           |  None                                                     |
| PUT    | `/api/auth/identity`      | Update email/password                  | Yes           | `currentPassword` (required), `newPassword?`, `newEmail?` |
| POST   | `/api/auth/refresh`       | Refresh the access token               | No            | `None`                                                    |

#### User Management Service (Admin only)

| Method | Endpoint                  | Description                            | Auth Required | Body Parameters                                           |
| ------ | ------------------------- | -------------------------------------- | ------------- | --------------------------------------------------------- |


#### Email Verification Service:

| Method | Endpoint                  | Description                            | Auth Required | Body Parameters                                           |
| ------ | ------------------------- | -------------------------------------- | ------------- | --------------------------------------------------------- |
| GET    | `/api/auth/verify-email`  | Validate the email verification token  | No            | `token` (query parameter: `?token=<token>`)               |
| POST   | `/api/auth/verify-email`  | Send email verification link           | YES           |  None                                                     |

* At least one of `newPassword`, `newEmail` should be provided when calling `PUT /api/auth/identity`

### Success Responses
#### Authentication Service

| Method | Endpoint                   | Success Status | Response Body                                                                                   |
| ------ | -------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`       | 201            | `{ "message": "Successfully created new user" }`                                                |
| POST   | `/api/auth/login`          | 200            | `{ "message": "Successfully signed in", "accessToken": "<token>" }`                             |
| GET    | `/api/auth/logout`         | 200            | `{ "message": "Successfully logged out" }`                                                      |
| GET    | `/api/auth/identity`       | 200            | `{ "message": "Successfully retrieved identity", "identity": <token payload> }`                 |
| PUT    | `/api/auth/identity`       | 200            | `{ "message": "Successfully updated identity", "details": updates, "accessToken": <token> }`    |
| POST   | `/api/auth/refresh`        | 200            | `{ "message": "Successfully refreshed access token", "accessToken": <token> }`                  |


#### User Management Service (Admin only)

| Method | Endpoint                 | Success Status | Response Body                                                                                   |
| ------ | ------------------------ | -------------- | ----------------------------------------------------------------------------------------------- |

#### Email Verification Service

| Method | Endpoint                 | Success Status | Response Body                                                                               |
| ------ | ------------------------ | -------------- | ------------------------------------------------------------------------------------------- |
| GET    | `/api/auth/verify-email` | 200            | `{message: "Successfully verified email address", email: <email address>`                   |
| POST   | `/api/auth/verify-email` | 200            | `{message: "Successfully sent verification email", link: <verification link>}`              |


### Error Responses
#### Authentication Service

| Method | Endpoint             | Possible Errors                                                                                                  |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | `400 Missing required registration fields`, `409 Email address already in use`                                   |
| POST   | `/api/auth/login`    | `400 Email and password required`, `401 Invalid credentials`, `403 Account deactivated`                          |
| PUT    | `/api/auth/identity` | `400 No User ID provided`, `400 No new credentials provided`, `400 New password cannot be the same as your current one`, `404 User not found`, `409 Email already in use by another account`, `500 Unexpected error when saving data` |
| POST   | `/api/auth/refresh`  | `401 No refresh token provided`, `401 Invalid or expired refresh token`, `404 User not found`                    |

#### User Management Service (Admin Only)

| Method | Endpoint             | Possible Errors                                                                                                  |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------------------------- |

#### Email Verification Service

| Method | Endpoint             | Possible Errors                                                                                                  |
| ------ | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/auth/verify-email`      | `400 No verification token provided`, `401 Invalid or expired token`, `401 Token already used`, `409 Stale token`, `404 User not found`, `409 Email already verified`, `500 Unexpected error when saving data` |
| POST   | `/api/auth/verify-email` | `400 User ID and Email required`                                                                              |


## Model & JWT Payload
### User Identity
The `Identity` model represents a user’s authentication and identity information. It is defined using Sequelize ORM and stored in the `identities` table.

| Field           | Type    | Required | Default    | Description                                               |
| --------------- | ------- | -------- | ---------- | --------------------------------------------------------- |
| `id`            | UUID    | Yes      | UUIDV4     | Primary key for each identity record.                     |
| `email`         | STRING  | Yes      | —          | User email, must be *unique* and a valid email format.    |
| `passwordHash`  | STRING  | Yes      | —          | Hashed password for authentication.                       |
| `role`          | STRING  | Yes      | `'normal'` | Role of the user (e.g., normal, admin).                   |
| `isActive`      | BOOLEAN | Yes      | `true`     | Indicates whether the user account is active or banned.   |
| `emailVerified` | BOOLEAN | Yes      | `false`    | Indicates if the user's email has been verified.          |

### Email Verification Token
The `EmailToken` model represents one-time email verification tokens. 

| Field       | Type    | Required | Default                            | Description                                                                 |
| ----------- | ------- | -------- | ---------------------------------- | --------------------------------------------------------------------------- |
| `id`        | UUID    | Yes      | UUIDV4                             | Primary key for each email token record.                                    |
| `userId`    | UUID    | Yes      | —                                  | ID of the user this token belongs to. Multiple tokens per user are allowed. |
| `token`     | STRING  | Yes      | —                                  | Unique verification token string.                                           |
| `used`      | BOOLEAN | Yes      | `false`                            | Indicates whether the token has been used.                                  |
| `createdAt` | DATE    | Yes      | `Now`                              | Timestamp when the token was created.                                       |
| `expiresAt` | DATE    | Yes      | `Now + EMAIL_TOKEN_EXPIRE`         | Expiration timestamp for the token.                                         |
| `usedAt`    | DATE    | No       | —                                  | Timestamp when the token was marked as used.                                |

**IMPORTANT NOTE**
+ `EMAIL_TOKEN_EXPIRE` is located at `.env`.
+ An FK to `Identity.id` is **not** enforced because tokens may be generated before the user record is fully confirmed (from the user profile service 
for example), and this avoids potential insertion failures while still allowing multiple tokens per user.
+ We can utilize the following commands to manually clean up the tokens:
  - `$ npm run cleanup`: Clean up expired tokens.
  - `$ npm run cleanup:force`: Clean up all tokens.


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
├── worker.js
├── package-lock.json
├── package.json
├── readme.md
├── scripts/
│   └── cleanupEmailTokens.js
├── workers/
│   └── ProfileCreationFailureListener.js
├── .env
└── src/
    ├── api/
    │   ├── controllers/
    │   │   ├── AuthController.js
    │   │   ├── AuthController.js
    │   │   └── EmailController.js
    │   └── routers/
    │       ├── AuthRouter.js
    │       ├── AuthRouter.js
    │       └── EmailRouter.js
    ├── config/
    │   ├── config.js
    │   └── connections.js
    ├── middlewares/
    │   ├── AuthMiddleware.js
    │   ├── AuthorizationMiddleware.js
    │   ├── ErrorHandler.js
    │   └── ValidateInputMiddleware.js
    ├── migrations/
    ├── models/
    │   ├── EmailToken.js
    │   └── Identity.js
    ├── seeders/
    ├── services/
    │   ├── AdminService.js
    │   ├── AuthService.js
    │   ├── EmailVerificationService.js
    │   ├── FailureConsumer.js
    │   └── PublisherService.js
    └── utils/
        ├── EmailVerificationUtils.js
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
+ Create a `.env` file locally: `$ cp .env.example .env`

### Database Migration
To initialize the database for local development and testing, follow the following steps:
```bash
$ cd src
$ npx sequelize-cli init
$ npx sequelize-cli db:migrate --config config/config.js
```
