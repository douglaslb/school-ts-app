import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";

export default (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body) {
        const validated = schema.parse(req.body);
        req.body = validated;

        next();
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json(error);
      }

      next(error);
    }
  };
