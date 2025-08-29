TODO - Next steps for Email integration

1. Add tests
   - Unit tests for `EmailSystem` with nodemailer mocked (happy path + error path).
   - Unit tests for SES path using AWS SDK mock or localstack.

2. Logging & retries
   - Add structured logging around send attempts and failures.
   - Implement exponential backoff retry for transient send failures.

3. Configuration
   - Move SMTP and SES credentials into Kubernetes Secrets (k8s/secret.yaml) and document values.
   - Add configuration validation at startup; fail fast if required envs are missing for chosen provider.

4. Monitoring & Metrics
   - Emit metrics for send attempts, successes, failures (Prometheus counters).
   - Add alerting thresholds for increased failure rates.

5. Security
   - Ensure secrets are not logged.
   - If using Google Workspace relay, prefer IP allowlist or service account flows where possible.

6. Integration
   - Expose an async job queue for large send volumes.
   - Add templates and templating support for HTML emails.

7. Documentation
   - Add example k8s Secret manifest for SMTP and SES credentials.
   - Document how to verify SES sandbox vs production send limits.

8. Deployment
   - Update Dockerfile to include only necessary runtime deps.
   - Add smoke test to CI that validates the `/api/send-email` endpoint (using a stub/mock provider).

9. Edge cases
   - Validate and sanitize `to` addresses; support multiple recipients and CC/BCC.
   - Add size limits for body and attachments (if attachments are added later).

10. Docs access and CI
   - Secure the Swagger UI (`/docs`) behind a development-only auth layer (e.g., shared dev token, basic auth, or middleware that only allows certain IPs) so interactive docs are not exposed in production.
   - Serve the raw OpenAPI YAML at `/docs/openapi.yaml` or provide a CI-only endpoint/token so CI pipelines can fetch the spec without enabling the interactive UI in non-development environments.
