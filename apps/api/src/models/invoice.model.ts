 
import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

// Zod schema for Invoice
export const InvoiceZodSchema = z.object({
  stripeInvoiceId: z.string(),
  userId: z.string(), // Will be validated as ObjectId in controller
  subscriptionId: z.string().optional(), // Will be validated as ObjectId in controller
  amountPaid: z.number(),
  currency: z.string(),
  status: z.string(),
  pdfUrl: z.string().url().optional(),
});

// Mongoose Schema for Invoice
export interface IInvoice extends Document {
  stripeInvoiceId: string;
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  amountPaid: number;
  currency: string;
  status: string;
  pdfUrl?: string;
  createdAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  stripeInvoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscriptionId: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
    required: false, // Can be null for one-off payments or initial invoices
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
  },
},
{
  timestamps: true, // Only createdAt is explicitly mentioned, but updatedAt is useful
});

const Invoice = model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
 