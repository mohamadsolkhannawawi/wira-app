import { getChannel } from "../config/rabbitmq.js";
import { logger } from "../utils/logger.utils.js";

const QUEUE_ANALYSIS_COMPLETED = "analysis.completed";

export const notificationJob = {
  async publishAnalysisCompleted(data: {
    userId: string;
    businessType: string;
    kelurahan: string;
    score: number;
  }): Promise<void> {
    const channel = getChannel();
    if (!channel) {
      logger.debug("RabbitMQ not available — skipping notification publish");
      return;
    }

    try {
      await channel.assertQueue(QUEUE_ANALYSIS_COMPLETED, { durable: true });
      channel.sendToQueue(
        QUEUE_ANALYSIS_COMPLETED,
        Buffer.from(JSON.stringify(data)),
        { persistent: true },
      );
      logger.debug(`Published to ${QUEUE_ANALYSIS_COMPLETED}`, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Failed to publish notification: ${msg}`);
    }
  },

  async startConsumer(): Promise<void> {
    const channel = getChannel();
    if (!channel) {
      logger.debug("RabbitMQ not available — consumer not started");
      return;
    }

    try {
      await channel.assertQueue(QUEUE_ANALYSIS_COMPLETED, { durable: true });
      channel.consume(QUEUE_ANALYSIS_COMPLETED, (msg) => {
        if (!msg) return;

        const content = JSON.parse(msg.content.toString()) as Record<string, unknown>;
        logger.info(`[NotificationJob] Processing:`, content);

        // TODO: Add email/push notification logic here

        channel.ack(msg);
      });
      logger.info(`Consumer started on queue: ${QUEUE_ANALYSIS_COMPLETED}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.warn(`Failed to start consumer: ${msg}`);
    }
  },
};
