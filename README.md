# Email Helper

This folder centralizes the code that used to live under `frontend/email-analyzer`.

## Structure

- `frontend/`: standalone UI for the email helper page
- `backend/`: email-helper-specific auth and API routes

## Notes

- The original repository did not contain a Gmail backend implementation for the old `/api/gmail/*` routes.
- The new backend is a self-contained demo scaffold mounted at `/api/email-helper/*` and `/auth/email-helper/*`.
- The legacy `/email-analyzer/` route now redirects to `/email-helper/`.
