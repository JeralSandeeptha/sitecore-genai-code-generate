import { getChannel } from "../../config/rabbitmq";

export const sendToQueue = async (
  queue: string,
  message: unknown
): Promise<void> => {
  const channel = getChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );

  console.log("📤 Message sent:", message);
};
