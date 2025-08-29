# POST /api/send-email

Description:
Send an email using the configured provider. The provider is selected via the `EMAIL_PROVIDER` environment variable.

Request:
- Method: POST
- Headers: `Content-Type: application/json`
- Body (JSON):

```json
{
  "to": "recipient@example.com",
  "subject": "Test message",
  "text": "Plain text body"
}
```

Response:
- 200 OK - `{ "message": "Email sent successfully" }`
- 400 Bad Request - missing required fields
- 500 Internal Server Error - on send failure; `details` contains error message

Environment variables for email:
- `EMAIL_PROVIDER` - `google` or `ses` (default `google`)
- `SMTP_USER` / `SMTP_PASS` - for Google SMTP relay if auth is required
- `AWS_REGION` - used when `EMAIL_PROVIDER=ses`; AWS credentials must be available

Notes:
- The service uses `src/system/emailSystem.ts` which supports both providers.
