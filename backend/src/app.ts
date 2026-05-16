import cors from "cors";
import express from "express";
import { API_PREFIX } from "@wira-app/shared";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { notificationJob } from "./jobs/emailNotification.job.js";
import { logger } from "./utils/logger.utils.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(API_PREFIX, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  // Connect optional services
  await connectRabbitMQ();
  await notificationJob.startConsumer();

  app.listen(env.port, () => {
    logger.info(`${env.appName} is running on port ${env.port}`);
    logger.info(`API prefix: ${API_PREFIX}`);
    logger.info(`Environment: ${env.nodeEnv}`);
  });
};

start().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
