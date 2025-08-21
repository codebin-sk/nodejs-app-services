import express from 'express';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import RBACMiddleware from './middleware/rbac';
import { ABACMiddleware } from './middleware/abac';
import { SessionMonitor } from './middleware/sessionMonitor';
import BackendConnector from './services/backendConnector';
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

// Connect to backend service
/* backendConnector.connect(securityConfig.backendUrl); */
// backendConnector.connect("session-token"); // Example usage, remove if not needed

// Sample route
app.get('/api/resource', (req, res) => {
    res.send('Resource accessed');
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