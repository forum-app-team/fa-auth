import express from 'express';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import AuthRouter from './src/api/routers/AuthRouter.js';

const app = express();

app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/auth", AuthRouter);

// placeholder for global error handler

export default app;