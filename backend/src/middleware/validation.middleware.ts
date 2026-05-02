import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { ZodObject, ZodRawShape } from "zod";

type AnyZodSchema = ZodObject<ZodRawShape>;

export const validate = (schema: AnyZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: err.issues,
          },
        });
      } else {
        next(err);
      }
    }
  };
};
