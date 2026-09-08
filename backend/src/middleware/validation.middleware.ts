import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { asyncHandler } from '../utils/async-handler';

export const validate = (schema: AnyZodObject) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;

    next();
  });
