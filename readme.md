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
+ Create a `.env` file locally with the following variables:
```
PLACEHOLDER
```

## Pending Work
+ Send user profile message to Rabbit MQ
+ Add refresh token
+ implement user logout
+ Implement password management
