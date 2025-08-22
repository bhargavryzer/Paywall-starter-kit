
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Stripe sends webhooks as raw body, so we need a specific body parser for this route
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
