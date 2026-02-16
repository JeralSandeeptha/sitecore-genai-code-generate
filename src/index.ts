import './config/envConfig';
import './config/dbConfig';
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from "./utils/logger";

//import routes
import appRoute from "./api/routes/app.route";
import { envConfig } from './config/envConfig';
import { connectRabbitMQ } from './config/rabbitmq';
import { consumeQueue } from './config/rabbitmq/consumer';

const app: Application = express();
const PORT = process.env.PORT || 5004;
const QUEUE_NAME = "process_chat";

// Middlewares
app.use(cors({
  origin: `${envConfig.BASE_URL}`, // frontend URL
  credentials: true, // allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', appRoute); // Health routes

// start application
app.listen(PORT, async () => {
    await connectRabbitMQ();
    await consumeQueue(QUEUE_NAME);
    
    console.log(`Code Generator API is running on port ${PORT}`);
    logger.info(`Code Generator API is running on port ${PORT}`);
});

export default app;