 
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';



export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get token and check if it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded: any = verifyToken(token);
  if (!decoded) {
    return next(new AppError('Invalid token. Please log in again!', 401));
  }

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // TODO: Check if user changed password after the token was issued

  // Grant access to protected route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // roles is an array like ['admin', 'lead-guide']
    if (!req.user || !roles.includes(req.user.roles[0])) { // Assuming single role for simplicity
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
 