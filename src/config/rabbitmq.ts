import * as amqp from "amqplib";
import { Channel } from "amqplib";
import { envConfig } from "./envConfig";
import logger from "../utils/logger";

let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  try {
    const connection = await amqp.connect(envConfig.RABBITMQ_SERVICE_URL as string);
    channel = await connection.createChannel();

    logger.info("✅ RabbitMQ connected");
  } catch (error) {
    logger.error("❌ RabbitMQ connection error");
    process.exit(1);
  }
};

export const getChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};
