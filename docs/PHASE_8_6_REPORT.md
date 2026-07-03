# Phase 8.6 Report — Gmail API OTP Email System

## Phase Objective

Implement a production-style OTP email verification system using the Google Gmail API with OAuth refresh tokens. Every login requires email OTP verification before a JWT is issued. Password reset also uses OTP email verification with premium branded enterprise email templates.

## Gmail API Email Architecture

```
Auth Route → OTP Service → Email Template Service → Gmail Service → Gmail API
                ↓
           LoginOTP (SQLite)
```

1. **OAuth credentials** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` (env or `.google_refresh_token` file from OAuth callback).
2. **Gmail Service** (`gmail_service.py`) — Builds MIME multipart messages (HTML + plain text), refreshes access tokens, and sends via `users.messages.send`.
3. **Email Template Service** (`email_template_service.py`) — Premium dark enterprise HTML with inline CSS, gradient header, glassmorphism card, text logo, and per-digit OTP display.
4. **OTP Service** (`otp_service.py`) — Generates 6-digit codes, hashes with bcrypt, stores in `login_otps`, invalidates prior unused OTPs on resend.

## OTP Login Flow

1. `POST /api/auth/login` — Validates email/password, generates login OTP, sends email, returns `otp_required` (no JWT).
2. Frontend redirects to `/verify-otp`.
3. User enters 6-digit code in premium OTP UI.
4. `POST /api/auth/verify-login-otp` — Validates latest unused OTP, marks used, returns JWT + user.
5. `POST /api/auth/resend-login-otp` — Invalidates previous OTPs, sends new code (generic response if user not found).

## Password Reset Flow

1. `POST /api/auth/forgot-password` — Sends password_reset OTP if user exists; always returns generic success message.
2. Frontend navigates to `/reset-password`.
3. User enters email, OTP, new password, confirm password.
4. `POST /api/auth/reset-password` — Validates OTP, updates password.
5. User logs in with new password (OTP required again).

## Change Password Flow

1. Authenticated user visits `/change-password`.
2. `POST /api/auth/change-password` — Verifies current password, updates to new password.
3. User is logged out and redirected to login.

## Files Created

| File | Purpose |
|------|---------|
| `backend/app/models/otp.py` | `LoginOTP` SQLAlchemy model |
| `backend/app/schemas/otp.py` | OTP request/response schemas |
| `backend/app/services/email_template_service.py` | Premium HTML + plain text email templates |
| `frontend/src/components/auth/OtpInput.tsx` | 6-box OTP input with paste support |
| `frontend/src/pages/OTPVerification.tsx` | Login OTP verification page |
| `frontend/src/pages/ResetPassword.tsx` | Password reset with OTP |
| `frontend/src/pages/ChangePassword.tsx` | Protected change password page |
| `docs/PHASE_8_6_REPORT.md` | This report |

## Files Modified

| File | Changes |
|------|---------|
| `backend/app/services/gmail_service.py` | Refresh token fallback, config helpers, removed inline templates |
| `backend/app/services/otp_service.py` | `LoginOTP` model, purpose values `login` / `password_reset` |
| `backend/app/api/routes/auth.py` | OTP-required login, verify/resend, reset, change-password |
| `backend/app/core/config.py` | `FRONTEND_URL`, `OTP_EXPIRY_MINUTES` alias, version 0.8.6 |
| `backend/app/main.py` | Register `LoginOTP` model |
| `backend/app/models/__init__.py` | Export `LoginOTP` |
| `backend/app/api/routes/health.py` | `GET /api/health/email` (debug only) |
| `backend/.env.example` | Gmail + OTP env vars (no secrets) |
| `frontend/src/lib/api.ts` | OTP auth API methods |
| `frontend/src/context/AuthContext.tsx` | `requestLoginOtp`, `verifyLoginOtp` |
| `frontend/src/pages/Login.tsx` | OTP-first login flow |
| `frontend/src/pages/ForgotPassword.tsx` | Real API integration |
| `frontend/src/routes/index.tsx` | New auth routes |
| `frontend/src/components/layout/Sidebar.tsx` | Change password menu link |
| `README.md` | Phase 8.6 summary |

## Environment Variables

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=
GMAIL_SENDER_EMAIL=
GMAIL_SENDER_NAME=AetherAI Security
OTP_EXPIRY_MINUTES=10
FRONTEND_URL=http://localhost:5173
```

## Security Decisions

- OTP codes are **never stored in plain text** — bcrypt hashed via existing `hash_password`.
- OTP codes are **never logged** or returned in API responses.
- **Single-use** OTPs with expiry (`OTP_EXPIRY_MINUTES`, default 10).
- **Resend invalidates** previous unused OTPs for the same purpose.
- **Enumeration-safe** messages for forgot-password and resend-login-otp.
- Gmail health endpoint exposes only configuration status, not secrets.
- `GET /api/health/email` available only when `DEBUG=true`.

## Testing Steps

1. Start backend: `uvicorn app.main:app --reload --port 8000`
2. Start frontend: `npm run dev`
3. Check Gmail config: `GET http://localhost:8000/api/health/email`
4. Register a user at `/register`
5. Login at `/login` — verify OTP email arrives with premium design
6. Enter OTP at `/verify-otp` — confirm dashboard access
7. Logout and test resend OTP
8. Test forgot password at `/forgot-password`
9. Reset password at `/reset-password`
10. Login with new password + OTP
11. Change password at `/change-password` (sidebar user menu)

## Limitations

- Registration still issues JWT directly (no OTP on signup).
- No rate limiting on OTP send endpoints (recommended for production).
- SQLite `login_otps` table coexists with legacy `otp_tokens` table.
- Email deliverability depends on Gmail API sender account limits.
- OTP health endpoint hidden in production (`DEBUG=false`).

## Next Phase Recommendation

**Phase 8.7 — Security Hardening & OTP Rate Limiting**

- Add Redis or in-memory rate limits for OTP send/verify endpoints.
- Require OTP verification on registration.
- Add audit log for auth events (login, OTP sent, password changed).
- Session management with refresh tokens and device tracking.
- Admin dashboard for Gmail delivery status and OTP metrics.
