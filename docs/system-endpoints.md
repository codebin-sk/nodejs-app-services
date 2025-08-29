# System Endpoints

List of service-level endpoints and purpose.

- GET /healthz
  - Simple health check. Returns 200 `{ "status": "ok" }`.

- GET /readyz
  - Readiness check. Returns 200 `{ "status": "ready" }`.

- POST /api/send-email
  - Send email using configured provider (Google SMTP relay or AWS SES).
  - See `docs/api/send-email.md` for details.

- GET /api/resource
  - Example resource endpoint used in demo.

- GET /api/data
  - Connects to configured backend via `BackendConnector` and returns connectivity status.

- GET /api/protected
  - Protected route demonstrating RBAC + ABAC. See `docs/api/protected.md`.
