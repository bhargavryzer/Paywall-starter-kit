 
import { Schema, model, Document, UpdateQuery } from 'mongoose';
import crypto from 'crypto';
import { z } from 'zod';

// Zod schema for User
export const UserZodSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // This is for input validation, passwordHash will be stored
  name: z.string().min(1),
  roles: z.array(z.enum(['reader', 'admin'])).default(['reader']),
  stripeCustomerId: z.string().optional(),
});

// Mongoose Schema for User
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  roles: ('reader' | 'admin')[];
  stripeCustomerId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  roles: {
    type: [String],
    enum: ['reader', 'admin'],
    default: ['reader'],
  },
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not violate unique constraint
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
},
{
  timestamps: true,
});

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = model<IUser>('User', UserSchema);

export default User;

export type UserUpdateQuery = UpdateQuery<IUser>;
 