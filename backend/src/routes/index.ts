import { Router } from "express";
import { analysisRouter } from "./analysis.routes.js";
import { authRouter } from "./auth.routes.js";
import { healthRouter } from "./health.routes.js";
import { locationsRouter } from "./locations.routes.js";
import { userRouter } from "./user.routes.js";

const apiRouter = Router();

apiRouter.use("/locations", locationsRouter);
apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(analysisRouter);
apiRouter.use(userRouter);

export { apiRouter };
