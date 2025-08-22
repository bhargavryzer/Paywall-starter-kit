
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Subscription from '../models/subscription.model.js';
import Plan from '../models/plan.model.js';

export const getProtectedContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  // Find the user's active subscription
  const subscription = await Subscription.findOne({ userId, status: 'active' }).populate('planId');

  if (!subscription) {
    return next(new AppError('No active subscription found. Please subscribe to access this content.', 403));
  }

  const plan = subscription.planId as any; // Cast to any to access plan properties

  // Check if the user's plan allows access to this content
  // This is a simplified example. In a real application, you might have
  // content categories and plans that grant access to specific categories.
  if (!plan || !plan.features.includes('premium_content')) { // Assuming 'premium_content' is a feature in your plan model
    return next(new AppError('Your current plan does not grant access to this content.', 403));
  }

  res.status(200).json({
    status: 'success',
    message: 'Welcome! Here is your protected content.',
    data: {
      content: {
        title: 'Exclusive Article: The Future of AI in Finance',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...', // Placeholder content
        accessLevel: plan.name, // e.g., 'Premium', 'Pro'
      },
    },
  });
});

export const getFreeContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    message: 'Here is some free content for everyone.',
    data: {
      content: {
        title: 'Introduction to Paywalls',
        body: 'This is a free article accessible to all users.',
        accessLevel: 'Free',
      },
    },
  });
});
