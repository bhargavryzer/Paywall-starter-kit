 
import { Schema, model, Document } from 'mongoose';
import { z } from 'zod';

// Zod schema for FeatureFlag
export const FeatureFlagZodSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
  description: z.string().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
});

// Mongoose Schema for FeatureFlag
export interface IFeatureFlag extends Document {
  key: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>({
  key: {
    type: String,
    required: [true, 'Feature flag key is required'],
    unique: true,
    trim: true,
  },
  enabled: {
    type: Boolean,
    required: [true, 'Enabled status is required'],
    default: false,
  },
  description: {
    type: String,
    trim: true,
  },
  rolloutPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100, // Default to 100% rollout if not specified
  },
},
{
  timestamps: true,
});

const FeatureFlag = model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);

export default FeatureFlag;
 