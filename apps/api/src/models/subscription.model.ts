 
import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

// Zod schema for Subscription
export const SubscriptionZodSchema = z.object({
  userId: z.string(), // Will be validated as ObjectId in controller
  planId: z.string(), // Will be validated as ObjectId in controller
  stripeSubscriptionId: z.string(),
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid']),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
});

// Mongoose Schema for Subscription
export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  stripeSubscriptionId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'],
    required: true,
  },
  currentPeriodStart: {
    type: Date,
    required: true,
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
});

const Subscription = model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
 