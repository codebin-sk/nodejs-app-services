# GET /api/resource

Description:
Returns a simple resource string and triggers session monitoring when `x-user-id` is present.

Request:
- Method: GET
- Headers (optional): `x-user-id`

Response:
- 200 OK - `Resource accessed`

Notes:
- This is a demo endpoint used to show session monitoring behavior.
