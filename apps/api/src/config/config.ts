 
interface Config {
  port: number;
  mongoUri: string;
  redisUrl: string;
  jwtPrivateKeyPath: string;
  jwtPublicKeyPath: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  frontendUrl: string;
  smtpHost: string;
  smtpUser: string;
  smtpPass: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/paywall',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem',
  jwtPublicKeyPath: process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_STRIPE_WEBHOOK_SECRET',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  smtpHost: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  smtpUser: process.env.SMTP_USER || 'apikey',
  smtpPass: process.env.SMTP_PASS || 'YOUR_SENDGRID_API_KEY',
};

export default config;
 