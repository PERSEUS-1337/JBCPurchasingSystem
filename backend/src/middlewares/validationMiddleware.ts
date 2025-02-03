import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // console.log(result.error); // Log validation errors

      res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next(); 
  };
