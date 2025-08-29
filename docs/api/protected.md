# GET /api/protected

Description:
Protected endpoint demonstrating RBAC and ABAC checks.

Request:
- Method: GET
- Required headers for example usage:
  - `x-roles: admin,user` (must include `admin`)
  - `x-role: admin`
  - `x-department: engineering`

Response:
- 200 OK - `{ "message": "Protected resource accessed" }` when checks pass
- 403 Forbidden - when roles/attributes don't satisfy policies

Notes:
- RBAC implemented in `src/middleware/rbac.ts` and ABAC in `src/middleware/abac.ts`.
