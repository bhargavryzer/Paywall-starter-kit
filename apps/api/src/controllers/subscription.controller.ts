 
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Subscription from '../models/subscription.model.js';
import Plan from '../models/plan.model.js';
import User from '../models/user.model.js';
import stripe from '../services/stripe.service.js';

export const createSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { planId, stripePaymentMethodId } = req.body;
  const userId = req.user._id;

  const plan = await Plan.findById(planId);
  if (!plan) {
    return next(new AppError('Plan not found', 404));
  }

  // 1. Create a Stripe Customer (if not already exists for the user)
  let customerId = req.user.stripeCustomerId; // Assuming user model has stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: req.user.email,
      payment_method: stripePaymentMethodId,
      invoice_settings: {
        default_payment_method: stripePaymentMethodId,
      },
    });
    customerId = customer.id;
    await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
  }

  // 2. Attach payment method to customer
  await stripe.paymentMethods.attach(stripePaymentMethodId, {
    customer: customerId,
  });

  // 3. Update customer's default payment method
  await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: stripePaymentMethodId,
    },
  });

  // 4. Create Stripe Subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: plan.stripePriceId }],
    expand: ['latest_invoice.payment_intent'],
  });

  // 5. Create local Subscription record
  const subscription = await Subscription.create({
    userId,
    planId: plan._id,
    stripeSubscriptionId: stripeSubscription.id,
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  });

  res.status(201).json({
    status: 'success',
    message: 'Subscription created successfully',
    data: {
      subscription,
      stripeSubscription,
    },
  });
});

export const getCurrentSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subscription = await Subscription.findOne({ userId: req.user._id }).populate('planId');

  if (!subscription) {
    return next(new AppError('No active subscription found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      subscription,
    },
  });
});

export const upgradeDowngradeSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { planId } = req.body;
  const userId = req.user._id;

  const currentSubscription = await Subscription.findOne({ userId });
  if (!currentSubscription) {
    return next(new AppError('No active subscription found to modify', 404));
  }

  const newPlan = await Plan.findById(planId);
  if (!newPlan) {
    return next(new AppError('New plan not found', 404));
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(currentSubscription.stripeSubscriptionId);

  // Update the Stripe subscription
  const updatedStripeSubscription = await stripe.subscriptions.update(
    currentSubscription.stripeSubscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: 'always_invoice',
    }
  );

  // Update local subscription record
  currentSubscription.planId = newPlan._id;
  currentSubscription.status = updatedStripeSubscription.status;
  currentSubscription.currentPeriodStart = new Date(updatedStripeSubscription.current_period_start * 1000);
  currentSubscription.currentPeriodEnd = new Date(updatedStripeSubscription.current_period_end * 1000);
  currentSubscription.cancelAtPeriodEnd = updatedStripeSubscription.cancel_at_period_end;
  await currentSubscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Subscription updated successfully',
    data: {
      subscription: currentSubscription,
      stripeSubscription: updatedStripeSubscription,
    },
  });
});

export const cancelSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const subscription = await Subscription.findOne({ userId });
  if (!subscription) {
    return next(new AppError('No active subscription found to cancel', 404));
  }

  // Cancel Stripe subscription at period end
  const canceledStripeSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );

  // Update local subscription record
  subscription.cancelAtPeriodEnd = canceledStripeSubscription.cancel_at_period_end;
  subscription.status = canceledStripeSubscription.status; // Status might change to 'canceled' or 'active' until period end
  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Subscription will be canceled at the end of the current period',
    data: {
      subscription,
    },
  });
});

export const reactivateSubscription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  const subscription = await Subscription.findOne({ userId });
  if (!subscription) {
    return next(new AppError('No subscription found to reactivate', 404));
  }

  // Reactivate Stripe subscription
  const reactivatedStripeSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: false }
  );

  // Update local subscription record
  subscription.cancelAtPeriodEnd = reactivatedStripeSubscription.cancel_at_period_end;
  subscription.status = reactivatedStripeSubscription.status;
  await subscription.save();

  res.status(200).json({
    status: 'success',
    message: 'Subscription reactivated successfully',
    data: {
      subscription,
    },
  });
});

export const getInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  const query: any = { userId };

  if (status) {
    query.status = status;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate as string);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate as string);
    }
  }

  const totalInvoices = await Invoice.countDocuments(query);
  const invoices = await Invoice.find(query)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: invoices.length,
    totalPages: Math.ceil(totalInvoices / Number(limit)),
    currentPage: Number(page),
    data: {
      invoices,
     },
  });
});
 