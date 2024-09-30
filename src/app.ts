import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import router from './router/apiRouter';
import globalErrorHandler from './middlewares/globalErrorHandler';
import responseMessage from './constant/responseMessage';
import httpError from './utils/httpError';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = express();

//Middlewares
app.use(helmet());
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

//Routes
app.use('/api/v1', router);

//404 Error Handler
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('route'));
    } catch (err) {
        httpError(next, err, req, 404);
    }
});

//Global Error Handler
app.use(globalErrorHandler);

export default app;
