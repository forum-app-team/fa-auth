# Auth Microservice

A authentication microservice built with Node.js and Express. It handles user registration, login, and JWT-based session management.

## Features

## API Endpoints

| Method | Endpoint           | Description                            |   |   |
|--------|--------------------|----------------------------------------|---|---|
| POST   | /api/auth/register | Register a new user                    |   |   |
| POST   | /api/auth/login    | Logs in a user and returns a JWT token |   |   |
| ...    |                    |                                        |   |   |
|        |                    |                                        |   |   |

## Project Structure
```
fa-auth/
├── app.js
├── index.js
├── notes.md
├── package-lock.json
├── package.json
├── readme.md
└── src/
    ├── api/
    │   ├── controllers/
    │   │   └── AutController.js
    │   └── routers/
    │       └── AuthRouter.js
    ├── configs/
    │   └── connections.js
    ├── models/
    │   └── Identity.js
    ├── services/
    │   └── AuthService.js
    └── utils/
        └── genToken.js
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
