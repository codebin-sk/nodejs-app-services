# GET /api/data

Description:
Attempts to call the configured backend (`BACKEND_URL`) using `BackendConnector` and returns a simple JSON status.

Request:
- Method: GET

Response:
- 200 OK - `{ "message": "Connected to backend service" }` on success
- 500 Internal Server Error - if backend call fails

Configuration:
- `BACKEND_URL` - base URL for backend (default `http://localhost:4000`)
- `BACKEND_API_KEY` - forwarded in `x-api-key` header
