
import { Request, Response, NextFunction } from 'express';
import stripe from '../services/stripe.service.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import Subscription from '../models/subscription.model.js';
import User from '../models/user.model.js';
import Invoice from '../models/invoice.model.js';
import Plan from '../models/plan.model.js';
// This is your Stripe webhook secret. Ensure it's set in your environment variables.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const handleStripeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);//need to fix
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await handleSubscriptionCreatedOrUpdated(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    case 'customer.created':
      const customer = event.data.object;
      await handleCustomerCreated(customer);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

async function handleSubscriptionCreatedOrUpdated(stripeSubscription: any) {
  const subscriptionData = {
    stripeSubscriptionId: stripeSubscription.id,
    userId: null, // This will be populated from the User model based on stripeCustomerId
    planId: null, // This will be populated from the Plan model based on stripePriceId
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
  };

  // Find the user associated with this Stripe customer
  const user = await User.findOne({ stripeCustomerId: stripeSubscription.customer });
  if (user) {
    subscriptionData.userId = user._id;//need to fix
  } else {
    console.warn(`User not found for Stripe customer ID: ${stripeSubscription.customer}`);
    return; // Or handle this error appropriately
  }

  // Find the plan associated with this Stripe price
  const plan = await Plan.findOne({ stripePriceId: stripeSubscription.items.data[0].price.id });
  if (plan) {
    subscriptionData.planId = plan._id.toString();
  } else {
    console.warn(`Plan not found for Stripe price ID: ${stripeSubscription.items.data[0].price.id}`);
    return; // Or handle this error appropriately
  }

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: stripeSubscription.id },
    subscriptionData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Subscription ${stripeSubscription.id} created/updated.`);
}

async function handleSubscriptionDeleted(stripeSubscription: any) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: stripeSubscription.id },
    { status: 'canceled', cancelAtPeriodEnd: true },
    { new: true }
  );
  console.log(`Subscription ${stripeSubscription.id} deleted.`);
}

async function handleInvoicePaymentSucceeded(stripeInvoice: any) {
  // Ensure the invoice has a subscription ID to link it
  if (!stripeInvoice.subscription) {
    console.warn(`Invoice ${stripeInvoice.id} has no subscription ID. Skipping.`);
    return;
  }

  const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeInvoice.subscription });
  if (!subscription) {
    console.warn(`Local subscription not found for Stripe subscription ID: ${stripeInvoice.subscription}. Skipping invoice ${stripeInvoice.id}.`);
    return;
  }

  const invoiceData = {
    stripeInvoiceId: stripeInvoice.id,
    userId: subscription.userId,
    subscriptionId: subscription._id,
    amountPaid: stripeInvoice.amount_paid,
    currency: stripeInvoice.currency,
    status: stripeInvoice.status,
    pdfUrl: stripeInvoice.invoice_pdf,
  };

  await Invoice.findOneAndUpdate(
    { stripeInvoiceId: stripeInvoice.id },
    invoiceData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Invoice ${stripeInvoice.id} payment succeeded.`);
}

async function handleCustomerCreated(stripeCustomer: any) {
  console.log(`Stripe Customer created: ${stripeCustomer.id}`);
   await User.findOneAndUpdate({ email: stripeCustomer.email }, { stripeCustomerId: stripeCustomer.id });
}
