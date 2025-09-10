import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import AuthRouter from './src/api/routers/AuthRouter.js';
import errorHandler from './src/middlewares/ErrorHandler.js';
import AuthError from './src/utils/error.js';

const app = express();

app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth", AuthRouter);

app.use((req, res, next) => {
    const PageNotFound = new AuthError("Page not found", 404)
    next(PageNotFound);
});

app.use(errorHandler);

export default app;