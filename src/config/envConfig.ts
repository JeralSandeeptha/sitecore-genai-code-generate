import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export const envConfig = {
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    DOMAIN: process.env.DOMAIN,
    V0_API_KEY: process.env.V0_API_KEY,
    KNOWLEDGE_API_URL: process.env.KNOWLEDGE_API_URL,
    GATEWAY_SERVICE_URL: process.env.GATEWAY_SERVICE_URL,
    RABBITMQ_SERVICE_URL: process.env.RABBITMQ_SERVICE_URL
}
