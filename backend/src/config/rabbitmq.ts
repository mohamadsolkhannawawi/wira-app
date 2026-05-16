import amqp from "amqplib";
import { env } from "./env.js";

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
  if (!env.rabbitmqUrl) {
    console.warn("[RabbitMQ] No URL configured - message broker disabled");
    return;
  }
  try {
    const connection = await amqp.connect(env.rabbitmqUrl);
    channel = await connection.createChannel();
    console.log("[RabbitMQ] Connected");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[RabbitMQ] Connection failed:", msg);
  }
};

export const getChannel = (): amqp.Channel | null => channel;
