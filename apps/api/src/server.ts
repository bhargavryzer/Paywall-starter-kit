 
import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'mongo-sanitize';
import mongoose from 'mongoose';
import redis from 'redis';
import AppError from './utils/appError.js';
import errorHandler from './middlewares/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import rateLimit from './utils/rateLimit.js';
import planRoutes from './routes/plan.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { seedPlans } from './utils/seedPlans.js';

// Import configuration
import config from './config/config.js';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: config.frontendUrl }));
app.use(hpp());
app.use(express.json({ limit: '10kb' })); // Body parser, reading data into req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use((req: Request, res: Response, next: NextFunction) => {
  req.body = mongoSanitize(req.body);
  next();
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('DB connection successful!');
    seedPlans(); // Seed plans after successful DB connection
  })
  .catch(err => console.error('DB connection error:', err));

// Connect to Redis
const redisClient = redis.createClient({ url: config.redisUrl });
redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', err => console.error('Redis client error:', err));
redisClient.connect();

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// API routes
app.use('/v1/auth', authRoutes);

// Apply rate limiting to all requestsapp.use(rateLimit);
app.use('/v1/plans', planRoutes);
app.use('/v1/subscriptions', subscriptionRoutes);
// app.use('/v1/subscription', subscriptionRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/content', contentRoutes);
app.use('/v1/webhooks', webhookRoutes);
// app.use('/v1/webhooks', webhookRoutes);

// Global error handling middleware
app.use(errorHandler);

// Handle unhandled routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

const PORT = config.port || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { redisClient };
 