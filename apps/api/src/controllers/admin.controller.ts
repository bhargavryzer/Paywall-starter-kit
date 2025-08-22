
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import User from '../models/user.model.js';
import Subscription from '../models/subscription.model.js';
import Invoice from '../models/invoice.model.js';

// Admin: Get all users
export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await User.find().select('-passwordHash');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// Admin: Get a single user by ID
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id).select('-passwordHash');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Admin: Update user (e.g., change roles, name, email)
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, roles } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, roles },
    {
      new: true,
      runValidators: true,
    }
  ).select('-passwordHash');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user,
    },
  });
});

// Admin: Delete user
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Optionally, also delete their subscriptions and invoices
  await Subscription.deleteMany({ userId: user._id });
  await Invoice.deleteMany({ userId: user._id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin: Get all subscriptions
export const getAllSubscriptions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subscriptions = await Subscription.find().populate('userId').populate('planId');

  res.status(200).json({
    status: 'success',
    results: subscriptions.length,
    data: {
      subscriptions,
    },
  });
});

// Admin: Get all invoices
export const getAllInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const invoices = await Invoice.find().populate('userId').populate('subscriptionId');

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    data: {
      invoices,
    },
  });
});
