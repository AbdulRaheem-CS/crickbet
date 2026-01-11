/**
 * Environment Configuration
 * Centralized access to environment variables with defaults
 */

module.exports = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/crickbet',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // Payment Gateway
  payment: {
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
    secret: process.env.PAYMENT_GATEWAY_SECRET,
    webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET,
  },

  // UPI
  upi: {
    merchantId: process.env.UPI_MERCHANT_ID,
    apiKey: process.env.UPI_API_KEY,
  },

  // Casino Provider
  casino: {
    apiUrl: process.env.CASINO_PROVIDER_API_URL,
    apiKey: process.env.CASINO_PROVIDER_API_KEY,
    secret: process.env.CASINO_PROVIDER_SECRET,
  },

  // Odds Provider
  odds: {
    apiUrl: process.env.ODDS_PROVIDER_API_URL,
    apiKey: process.env.ODDS_PROVIDER_API_KEY,
  },

  // Email (SMTP)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 2525,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromEmail: process.env.FROM_EMAIL || 'noreply@crickbet.com',
    fromName: process.env.FROM_NAME || 'CrickBet',
  },

  // SMS
  sms: {
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'CRICKBT',
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET,
    region: process.env.AWS_REGION || 'ap-south-1',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};
