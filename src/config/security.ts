export const securityConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your-default-jwt-secret',
    sessionTimeout: process.env.SESSION_TIMEOUT || 3600, // in seconds
    enableSessionMonitoring: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};