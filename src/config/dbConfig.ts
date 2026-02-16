import logger from '../utils/logger';
import { envConfig } from './envConfig';
import mongoose from 'mongoose';

const MONGODB_URI = envConfig.DATABASE_URL || '';

// test the database connection
const testConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        logger.info('✅ MongoDB connection established successfully');
    } catch (error) {
        logger.error('❌ MongoDB connection failed');
        logger.error(error);
        process.exit(1); // Exit the process if DB connection fails
    }
};

// test the connection
testConnection();

export default mongoose;