 
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signToken, verifyToken } from '../utils/jwt.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/user.model.js';
import { redisClient } from '../server.js';
import sendEmail from '../utils/email.js';

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id); //need to fix

  // Remove passwordHash from output
  user.passwordHash = undefined; //need to fix

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with that email already exists', 409));
  }

  const passwordHash = await bcrypt.hash(password, 14);

  const newUser = await User.create({
    email,
    passwordHash,
    name,
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    // Blacklist the token in Redis for a short period (e.g., 1 hour)
    // The actual expiration should be tied to the JWT's expiration
    const decoded: any = verifyToken(token);
    if (decoded && decoded.exp) {
      const expiresIn = decoded.exp - (Date.now() / 1000); // Time until token expires in seconds
      if (expiresIn > 0) {
        await redisClient.setEx(`blacklist:${token}`, expiresIn, 'blacklisted');
      }
    }
  }

  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.passwordHash = await bcrypt.hash(req.body.password, 14);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

export const refreshAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // For simplicity, we'll just re-issue a new token if the old one is valid
  // In a real-world app, you might use refresh tokens stored in a database
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded: any = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    createSendToken(user, 200, res);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
});
 