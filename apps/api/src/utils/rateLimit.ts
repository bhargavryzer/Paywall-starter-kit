 
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../server.js'; // Assuming redisClient is exported from server.ts
import AppError from './appError.js';

const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip; // Or use a more robust IP detection method
  const key = `rate_limit:${ip}`;
  const limit = 100; // 100 requests
  const windowMs = 15 * 60 * 1000; // 15 minutes

  try {
    const requests = await redisClient.incr(key);

    if (requests === 1) {
      await redisClient.pExpire(key, windowMs);
    }

    if (requests > limit) {
      return next(new AppError('Too many requests from this IP, please try again after 15 minutes', 429));
    }

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - requests);

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next(new AppError('Something went wrong with rate limiting', 500));
  }
};

export default rateLimit;
 