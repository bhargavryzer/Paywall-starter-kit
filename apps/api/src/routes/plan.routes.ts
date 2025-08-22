 
import { Router } from 'express';
import { getAllPlans, getPlan, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validation.middleware.js';
import { PlanZodSchema } from '../models/plan.model.js';

const router = Router();

// Public routes
router.get('/', getAllPlans);
router.get('/:id', getPlan);

// Admin routes
router.use(protect, restrictTo('admin'));

router.post('/', validate(PlanZodSchema), createPlan);
router.patch('/:id', validate(PlanZodSchema.partial()), updatePlan);
router.delete('/:id', deletePlan);

export default router;
 