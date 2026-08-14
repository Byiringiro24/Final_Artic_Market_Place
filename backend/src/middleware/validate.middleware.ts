import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../lib/apiResponse';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body || req.body;
      (req as Request & { validatedQuery?: unknown }).validatedQuery = parsed.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((e) => ({
          field: e.path.slice(1).join('.'),
          message: e.message,
        }));
        return ApiResponse.badRequest(res, 'Validation failed', errors);
      }
      next(error);
    }
  };
}
