 
import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
} from '../controllers/auth.controller.js';
import validate from '../middlewares/validation.middleware.js';
import { UserZodSchema } from '../models/user.model.js';

const router = Router();

router.post('/register', validate(UserZodSchema.pick({
  email: true,
  password: true,
  name: true,
})), register);
router.post('/login', validate(UserZodSchema.pick({
  email: true,
  password: true,
})), login);
router.post('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.post('/refresh', refreshAccessToken);

export default router;
 