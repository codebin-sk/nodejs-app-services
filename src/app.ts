import express from 'express';
import { RBACMiddleware } from './middleware/rbac';
import { ABACMiddleware } from './middleware/abac';
import { SessionMonitor } from './middleware/sessionMonitor';
import { BackendConnector } from './services/backendConnector';
import { securityConfig } from './config/security';

const app = express();
const port = process.env.PORT || 3000;

// Initialize middleware instances
const rbacMiddleware = new RBACMiddleware();
const abacMiddleware = new ABACMiddleware();
const sessionMonitor = new SessionMonitor();
const backendConnector = new BackendConnector();

// Middleware setup
app.use(express.json());
app.use(sessionMonitor.startSession());
app.use(rbacMiddleware.checkRole);
app.use(abacMiddleware.checkAttributes);

// Example route to connect to backend service
app.get('/api/data', async (req, res) => {
    try {
        const data = await backendConnector.connect();
        res.json(data);
    } catch (error) {
        res.status(500).send('Error connecting to backend service');
    }
});

// Connect to backend service
backendConnector.connect(securityConfig.backendUrl);

// Sample route
app.get('/api/resource', (req, res) => {
    res.send('Resource accessed');
});

// Start the server
app.listen(port, () => {
    console.log(`Middleware Integration Service running on port ${port}`);
});