import { Request, Response } from 'express';
import { THttpResponse } from '../types/types';
import config from '../config/config';
import { EApplicationEnviroment } from '../constant/application';
import logger from './logger';

export default (req: Request, res: Response, responseStatusCode: number, responseMessage: string, data: unknown = null): void => {
    const response: THttpResponse = {
        success: true,
        statusCode: responseStatusCode,
        request: {
            ip: req.ip || null,
            method: req.method,
            url: req.originalUrl
        },
        message: responseMessage,
        data: data
    };

    logger.info('CONTROLLER_RESPONSE', {
        meta: response
    });

    //Prod Env Check
    if (config.ENV === EApplicationEnviroment.PRODUCTION) {
        delete response.request.ip;
    }

    res.status(response.statusCode).json(response);
};
