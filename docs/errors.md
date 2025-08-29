# Error Responses

Common errors returned by the service:

- 400 Bad Request
  - Missing required input fields (e.g., `to`, `subject`, `text/html` for `/api/send-email`).

- 403 Forbidden
  - RBAC or ABAC checks failed for protected endpoints.

- 500 Internal Server Error
  - Backend connectivity failures or email provider failures. Check service logs for details.

Troubleshooting tips:
- Verify required environment variables are set for the chosen provider.
- For SES, ensure AWS credentials and region are configured and SES is out of sandbox or recipient is verified.
- For Google SMTP relay, ensure relay settings (IP allowlist or authentication) are configured in Google Workspace admin.
