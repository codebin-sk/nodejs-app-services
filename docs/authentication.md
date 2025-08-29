# Authentication & Configuration

This service uses simple session middleware and header-driven example auth for demo purposes.

Important environment variables:
- `SESSION_SECRET` - session signing secret (required in production).
- `BACKEND_API_KEY` - API key forwarded to backend calls.
- `EMAIL_PROVIDER` - `google` (default) or `ses` to select email provider.
- `SMTP_USER`, `SMTP_PASS` - SMTP credentials if using Google relay that requires auth.
- `AWS_REGION` - AWS region to use when `EMAIL_PROVIDER=ses`. AWS credentials must be available via environment or instance profile.

Headers used by middleware examples:
- `x-user-id` - optional, used by session monitor to start a session.
- `x-roles` - comma-separated roles used by RBAC examples (e.g., `admin,user`).
- `x-role`, `x-department` - used by ABAC example in `GET /api/protected`.
