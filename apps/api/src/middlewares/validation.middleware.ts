 
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import AppError from '../utils/appError.js';

const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const errorMessages = err.errors.map((issue: any) => ({
          path: issue.path,
          message: issue.message,
        }));
        return next(new AppError('Validation failed', 400, errorMessages));
      }
      next(new AppError('Something went wrong during validation', 500));
    }
  };

export default validate;
 