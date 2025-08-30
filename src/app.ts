import express from 'express';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import RBACMiddleware from './middleware/rbac';
import { ABACMiddleware } from './middleware/abac';
import { SessionMonitor } from './middleware/sessionMonitor';
import BackendConnector from './services/backendConnector';
import { EmailSystem, EmailOptions, EmailProvider } from './system/emailSystem';
/* import { securityConfig } from './config/security'; */
import {
    SESSION_SECRET,
    BACKEND_URL,
    BACKEND_API_KEY,
    TLS_CERT_PATH,
    TLS_KEY_PATH
} from './config/security';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Email system setup (provider configured via EMAIL_PROVIDER)
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER as EmailProvider) || 'google';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const AWS_REGION = process.env.AWS_REGION || undefined;

const emailSystem = new EmailSystem(
  EMAIL_PROVIDER === 'ses'
    ? { provider: 'ses', sesConfig: AWS_REGION ? { region: AWS_REGION } : undefined }
    : { provider: 'google', user: SMTP_USER, pass: SMTP_PASS }
);
// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, text/html' });
  }
  const mailOptions: EmailOptions = {
    from: SMTP_USER,
    to,
    subject,
    text,
    html
  };
  try {
    await emailSystem.sendEmail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending email', details: error instanceof Error ? error.message : error });
  }
});

// Serve OpenAPI / Swagger UI only in development
if (process.env.NODE_ENV === 'development') {
  try {
    const openapiPath = path.join(__dirname, '..', 'docs', 'openapi.yaml');
    const openapiSpec = YAML.load(openapiPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
    // also serve raw YAML
    app.get('/docs/openapi.yaml', (_req, res) => {
      res.sendFile(openapiPath);
    });
    console.log('Swagger UI enabled at /docs (development mode)');
  } catch (err) {
    console.warn('Swagger UI disabled: could not load openapi.yaml', err instanceof Error ? err.message : err);
  }
} else {
  // In non-development environments, do not expose interactive API docs
  console.log('Swagger UI not enabled (NODE_ENV !== development)');
}

// Initialize middleware instances
const rbacMiddleware = new RBACMiddleware(["admin", "user"]); // Example roles
const abacMiddleware = new ABACMiddleware();
const sessionMonitor = new SessionMonitor();
// Connect to backend service
const backendConnector = new BackendConnector(BACKEND_URL, BACKEND_API_KEY); //backend URL here

// Middleware setup
app.use(express.json());
/* app.use(sessionMonitor.startSession());
app.use(rbacMiddleware.checkRole);
app.use(abacMiddleware.checkAttributes); */

// Middleware setup
app.use(express.json());
/* app.use(sessionMonitor.startSession());
app.use(rbacMiddleware.checkRole);
app.use(abacMiddleware.checkAttributes); */
// Session middleware
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === 'production' }
    })
);
// Example session middleware: you may need to adapt this to your session logic
app.use((req, res, next) => {
    // Example: extract userId from request (e.g., from JWT or session)
    let userId = req.headers["x-user-id"];
    if (Array.isArray(userId)) {
        userId = userId[0];
    }
    sessionMonitor.startSession(userId ? String(userId) : "anonymous");
    next();
});
// RBAC and ABAC middleware usage should be adapted to your route logic
// Example RBAC middleware for a protected route:
// app.use("/api/protected", (req, res, next) => rbacMiddleware.checkRole("admin") ? next() : res.status(403).send("Forbidden"));

// Helper middlewares for RBAC and ABAC protections
const requireRole = (requiredRole: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rolesHeader = req.headers['x-roles'];
    const roles = Array.isArray(rolesHeader)
      ? rolesHeader
      : (typeof rolesHeader === 'string' ? rolesHeader.split(',').map(r => r.trim()) : []);
    const rbac = new RBACMiddleware(roles as string[]);
    if (!rbac.checkRole(requiredRole)) {
      return res.status(403).send('Forbidden');
    }
    (req as any).rbac = rbac;
    next();
  };
};

const requireAbac = (action: string, resourceAttributes: Record<string, any>) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userAttributes: Record<string, any> = {
      role: typeof req.headers['x-role'] === 'string' ? req.headers['x-role'] : 'user',
      department: typeof req.headers['x-department'] === 'string' ? req.headers['x-department'] : 'general'
    };
    if (!abacMiddleware.checkAttributes(userAttributes, resourceAttributes, action)) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
};

// Example route to connect to backend service
app.get('/api/data', async (req, res) => {
    try {
        /* const data = await backendConnector.connect();
        res.json(data); */
        // Connect to backend service
        backendConnector.connect("session-token");
        res.json({ message: "Connected to backend service" });
    } catch (error) {
        res.status(500).send('Error connecting to backend service');
    }
});

// Protected route with RBAC (admin) and ABAC (department match + action=view)
app.get(
  '/api/protected',
  requireRole('admin'),
  requireAbac('view', { department: 'engineering' }),
  (req, res) => {
    res.json({ message: 'Protected resource accessed' });
  }
);

// Connect to backend service
/* backendConnector.connect(securityConfig.backendUrl); */
// backendConnector.connect("session-token"); // Example usage, remove if not needed

// Sample route
app.get('/api/resource', (req, res) => {
    res.send('Resource accessed');
});

// Health and readiness endpoints
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/readyz', (_req, res) => {
  // Optionally, add deeper checks (e.g., backendConnector connectivity)
  res.status(200).json({ status: 'ready' });
});

// read TLS cert/key if provided
let tlsOptions: https.ServerOptions | undefined;
if (TLS_CERT_PATH && TLS_KEY_PATH) {
  tlsOptions = {
    cert: fs.readFileSync(TLS_CERT_PATH),
    key:  fs.readFileSync(TLS_KEY_PATH)
  };
}

// Start the server: HTTPS or HTTP
if (tlsOptions) {
  https.createServer(tlsOptions, app).listen(port, () => {
    console.log(`HTTPS Middleware Service listening on ${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`HTTP Middleware Service listening on ${port}`);
  });
}

import { sendMail } from './utils/mailer';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize middleware instances
const rbacMiddleware = new RBACMiddleware(["admin", "user"]); // Example roles
const abacMiddleware = new ABACMiddleware();
const sessionMonitor = new SessionMonitor();
// Connect to backend service
const backendConnector = new BackendConnector(BACKEND_URL, BACKEND_API_KEY); //backend URL here

// Sample endpoint to send email
app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;
  try {
    const info = await sendMail({ to, subject, text, html });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: errorMsg });
  }
});