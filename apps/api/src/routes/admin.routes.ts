import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllSubscriptions,
  getAllInvoices,
} from '../controllers/admin.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes should be protected and restricted to 'admin' role
router.use(protect);
router.use(restrictTo('admin'));

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

router.route('/subscriptions')
  .get(getAllSubscriptions);

router.route('/invoices')
  .get(getAllInvoices);

export default router;