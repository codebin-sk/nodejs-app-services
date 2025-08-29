# Middleware Integration Service

## Overview
The Middleware Integration Service is designed to provide a secure and efficient way to manage access control and session monitoring for backend services. It implements both Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) to ensure that users have the appropriate permissions to access resources. This service also includes session-based monitoring to track user activity and manage sessions effectively.

## Detailed Overview
Secure middleware layer with session-based monitoring, RBAC/ABAC hooks, and a secure connector to a backend service.

This project is licensed under the MIT License. See the LICENSE file for more details.

## API Documentation

- Base URL (local): `http://localhost:3000`
- Default headers:
   - `x-user-id` (optional): If provided, the service starts a monitored session for that user ID on each request.

### API Endpoints

| Method | Endpoint        | Description                                                                 |
| :----- | :-------------- | :-------------------------------------------------------------------------- |
| GET    | `/api/resource` | Simple resource endpoint. Starts a session if `x-user-id` is provided.      |
| GET    | `/api/data`     | Connects to the configured backend and returns a connectivity status JSON.  |
| GET    | `/api/protected`| Protected endpoint requiring admin role and engineering department.         |
| POST   | `/api/send-email` | Send an email using the configured provider (Google SMTP relay or AWS SES). |
| GET    | `/healthz`      | Health check endpoint. Returns 200 status with `{ status: "ok" }`.         |
| GET    | `/readyz`       | Readiness check endpoint. Returns 200 status with `{ status: "ready" }`.   |

Notes
- Session monitoring is applied to all requests via middleware, reading `x-user-id`. If not provided, the session is tracked as `anonymous`.
- RBAC and ABAC middlewares are scaffolded and ready for route-level protection but are not yet enforced globally. Add them on specific routes as needed.

### Request/Response Examples

1) GET `/api/resource`
- Request headers (optional):
   - `x-user-id: alice`
- 200 Response body (text):
```
Resource accessed
```

2) GET `/api/data`
- Description: Establishes a secure call to the backend using the `BackendConnector` and returns a JSON confirmation.
- 200 Response body (JSON):
```
{ "message": "Connected to backend service" }
```
- 500 Response body (text):
```
Error connecting to backend service
```

3) GET `/api/protected`
- Description: Access restricted endpoint with RBAC and ABAC protections.
- Request headers (required):
   - `x-roles: admin,user` (must include "admin")
   - `x-role: admin`
   - `x-department: engineering`
- 200 Response body (JSON):
```
{ "message": "Protected resource accessed" }
```
- 403 Response body (text):
```
Forbidden
```

4) GET `/healthz`
- 200 Response body (JSON):
```
{ "status": "ok" }
```

5) GET `/readyz`
- 200 Response body (JSON):
```
{ "status": "ready" }
```

### Send Email API

POST `/api/send-email`

- Description: Sends an email using the configured provider. The service selects the provider based on the `EMAIL_PROVIDER` environment variable (`google` or `ses`).
- Request body (JSON):

```
{
   "to": "recipient@example.com",
   "subject": "Test message",
   "text": "Plain text body"  // or "html": "<p>HTML body</p>"
}
```

- Response: 200 on success: `{ "message": "Email sent successfully" }`.
- Errors: 400 for missing fields, 500 for send failures. Details are returned in the `details` field on error responses.

- Environment variables used by email feature:
   - `EMAIL_PROVIDER` - `google` (default) or `ses`.
   - `SMTP_USER` / `SMTP_PASS` - credentials for Google SMTP relay if required by your relay configuration.
   - `AWS_REGION` (when using `ses`) - region for the AWS SES client. AWS credentials must be available via environment, shared credentials, or instance role.

Example curl (using Google SMTP provider configured via env):

```
curl -X POST http://localhost:3000/api/send-email \
   -H "Content-Type: application/json" \
   -d '{"to":"you@example.com","subject":"Hello","text":"Test email"}'
```

## Security and Configuration

Environment variables read by the service (see `src/config/security.ts`):
- `SESSION_SECRET` – Session signing secret (required in production)
- `BACKEND_URL` – Base URL for the downstream backend (default: `http://localhost:4000`)
- `BACKEND_API_KEY` – API key sent to the backend in `x-api-key` header
- `TLS_CERT_PATH`, `TLS_KEY_PATH` – If both set, the service starts in HTTPS mode
- `PORT` – Port to listen on (default: `3000`)

## Next Steps (optional)
- ✅ Protect routes with RBAC/ABAC (implemented at `/api/protected`)
- ✅ Add `/healthz` and `/readyz` endpoints for health checks (implemented)
- Expand the backend connector to make real calls and propagate auth/session as needed.

## Features
- **RBAC**: Role-Based Access Control to manage user permissions based on their roles.
- **ABAC**: Attribute-Based Access Control to evaluate user attributes against resource attributes for fine-grained access control.
- **Session Monitoring**: Session-based monitoring to track user activity and manage sessions effectively. Tracks user sessions and activities, allowing for session management and monitoring.
- **Secure Backend Connection**: Establishes a secure connection to backend services for data retrieval. Manages secure connections to backend services, ensuring data integrity and confidentiality.

## Future Plans
- https://grok.com/share/c2hhcmQtMw%3D%3D_8c05b2e1-33e0-4c65-8557-4d1385aa859c
- Gemini --> NestJS vs. Express for Middleware

## Project Structure
```
middleware-integration-service
├── .github/                  # GitHub repository files
│   └── workflows/            # GitHub Actions workflows
│       └── ci-cd.yaml        # CI/CD pipeline configuration
├── k8s/                      # Kubernetes manifests
│   ├── configmap.yaml        # ConfigMap for environment variables
│   ├── deployment.yaml       # Deployment configuration
│   ├── ingress.yaml          # Ingress for routing external traffic
│   ├── secret.yaml           # Secret for sensitive data
│   └── service.yaml          # Service for network exposure
├── src/
│   ├── app.ts                # Entry point of the application
│   ├── config/
│   │   └── security.ts       # Security configuration and environment variables
│   ├── middleware/
│   │   ├── rbac.ts           # RBAC middleware implementation
│   │   ├── abac.ts           # ABAC middleware implementation
│   │   └── sessionMonitor.ts # Session monitoring middleware implementation
│   ├── services/
│   │   └── backendConnector.ts # Backend service connection management
│   ├── types/
│   │   ├── express-session.d.ts # Type declarations for express-session
│   │   └── index.ts          # Type definitions for the application
│   └── utils/
│       └── security.ts       # Security utility functions
├── .dockerignore             # Files to exclude from Docker build
├── .gitignore                # Files to exclude from git
├── Dockerfile                # Container build instructions
├── package.json              # NPM package configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd middleware-integration-service
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

### Local Development
To start the middleware integration service for local development:
```bash
npm start
```

For development with automatic restart on file changes:
```bash
npm run start:dev
```

### Docker Deployment
Build and run the service in Docker:

```bash
# Build the Docker image
docker build -t middleware-integration-service:latest .

# Run the container
docker run -p 3000:3000 --name middleware-service \
  -e SESSION_SECRET=your-session-secret \
  -e BACKEND_URL=http://your-backend-url \
  -e BACKEND_API_KEY=your-api-key \
  middleware-integration-service:latest
```

### Kubernetes Deployment
Deploy to Kubernetes using provided manifests:

```bash
# Apply ConfigMap and Secrets first
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Deploy the application
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### Scaling in Kubernetes
To scale the number of replicas:

```bash
# Scale to 3 replicas
kubectl scale deployment middleware-integration-service --replicas=3

# Check the status of your pods
kubectl get pods -l app=middleware-integration-service
```

Alternatively, you can edit the `k8s/deployment.yaml` file to modify the `replicas` field:

```yaml
spec:
  replicas: 3  # Change this value to adjust the number of instances
```

Then reapply the deployment:
```bash
kubectl apply -f k8s/deployment.yaml
```

#### Horizontal Pod Autoscaling
For production environments, you may want to set up automatic scaling:

```bash
# Create an autoscaler (scales between 2-10 replicas based on 75% CPU utilization)
kubectl autoscale deployment middleware-integration-service --cpu-percent=75 --min=2 --max=10
```

To view the status of your HorizontalPodAutoscaler:
```bash
kubectl get hpa
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.