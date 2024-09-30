import app from './app';
import config from './config/config';
import { initRateLimiter } from './config/rateLimiter';
import DBService from './services/DBService';
import logger from './utils/logger';

const server = app.listen(config.PORT);

(async () => {
    try {
        const connection = await DBService.connect();
        logger.info('DB CONNECTION...', {
            meta: {
                CONNECTION_NAME: connection.name
            }
        });

        initRateLimiter(connection);
        logger.info('RATE LIMITER INITIALIZED');

        logger.info('Application Started...', {
            meta: {
                PORT: config.PORT,
                SERVER_URL: config.SERVER_URL
            }
        });
    } catch (err) {
        logger.error('Error Starting Application...', err);

        server.close((error) => {
            if (error) logger.error('Error Closing Application...', error);

            process.exit(1);
        });
    }
})();
