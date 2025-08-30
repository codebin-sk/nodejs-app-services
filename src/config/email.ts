import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET      = process.env.JWT_SECRET      ?? 'change_me_jwt';
export const SESSION_SECRET  = process.env.SESSION_SECRET  ?? 'change_me_session';
export const BACKEND_API_KEY = process.env.BACKEND_API_KEY ?? '';
export const BACKEND_URL      = process.env.BACKEND_URL     ?? 'http://localhost:4000';
export const TLS_CERT_PATH    = process.env.TLS_CERT_PATH  ?? '';
export const TLS_KEY_PATH     = process.env.TLS_KEY_PATH   ?? '';
export const REDIS_URL       = process.env.REDIS_URL       ?? '';
export const REDIS_PASSWORD  = process.env.REDIS_PASSWORD  ?? '';
export const SESSION_TIMEOUT  = parseInt(process.env.SESSION_TIMEOUT ?? '3600', 10); // seconds
export const ENABLE_SESSION_MONITORING = true;
export const ALLOWED_ORIGINS  = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
export const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10)
};

// SMTP configuration
export const SMTP_USERNAME = process.env.SMTP_USERNAME ?? 'account@gmail.com';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD ?? 'app_password_here';
export const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
export const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '465', 10);
export const SMTP_SECURE = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true;
