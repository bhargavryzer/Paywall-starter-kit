 
import { Schema, model, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for Feature
export const FeatureZodSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

// Zod schema for Plan
export const PlanZodSchema = z.object({
  stripePriceId: z.string(),
  name: z.string(),
  priceCents: z.number().int().positive(),
  interval: z.enum(['month', 'year']),
  features: z.array(FeatureZodSchema),
});

// Mongoose Schema for Feature
export interface IFeature {
  name: string;
  description?: string;
}

// Mongoose Schema for Plan
export interface IPlan extends Document {
  stripePriceId: string;
  name: string;
  priceCents: number;
  interval: 'month' | 'year';
  features: IFeature[];
}

const PlanSchema = new Schema<IPlan>({
  stripePriceId: {
    type: String,
    required: [true, 'Stripe Price ID is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    unique: true,
  },
  priceCents: {
    type: Number,
    required: [true, 'Price in cents is required'],
    min: 0,
  },
  interval: {
    type: String,
    enum: ['month', 'year'],
    required: [true, 'Billing interval is required'],
  },
  features: [
    {
      name: { type: String, required: true },
      description: { type: String },
    },
  ],
});

const Plan = model<IPlan>('Plan', PlanSchema);

export default Plan;
 