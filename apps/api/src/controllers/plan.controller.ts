import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import Plan from '../models/plan.model.js';
import AppError from '../utils/appError.js';

export const getAllPlans = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plans = await Plan.find();

  res.status(200).json({
    status: 'success',
    results: plans.length,
    data: {
      plans,
    },
  });
});

export const getPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    return next(new AppError('No plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// Admin only functions (for seeding or managing plans)
export const createPlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newPlan = await Plan.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      plan: newPlan,
    },
  });
});

export const updatePlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    return next(new AppError('No plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

export const deletePlan = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const plan = await Plan.findByIdAndDelete(req.params.id);

  if (!plan) {
    return next(new AppError('No plan found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
 