 
import express from 'express';
import {
  createSubscription,
  getCurrentSubscription,
  upgradeDowngradeSubscription,
  cancelSubscription,
  reactivateSubscription,
  getInvoices,
} from '../controllers/subscription.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { SubscriptionZodSchema } from '../models/subscription.model.js';

const router = express.Router();

// All routes after this middleware are protected
router.use(protect);

router.post('/', validate(SubscriptionZodSchema), createSubscription);
router.get('/me', getCurrentSubscription);
router.patch('/upgrade-downgrade', upgradeDowngradeSubscription);
router.patch('/cancel', cancelSubscription);
router.patch('/reactivate', reactivateSubscription);
router.get('/invoices', getInvoices);

// Admin-only routes (example)
// router.route('/').get(restrictTo('admin'), getAllSubscriptions);

export default router;
 