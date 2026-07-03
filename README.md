# AetherAI Enterprise Hub

AI-powered internal collaboration platform for modern companies.

## Overview

AetherAI Enterprise Hub is a full-stack enterprise SaaS platform that unifies team communication, knowledge management, task tracking, and AI assistance into one intelligent workspace.

**Phase 0** establishes the project foundation: a FastAPI backend, a premium React frontend landing page, and project documentation.

**Phase 1** adds a premium authenticated-style dashboard UI with sidebar, topbar, metric cards, AI assistant preview, team chat, task board, knowledge search, activity feed, analytics panel, and Framer Motion animations.

**Phase 2** adds a premium authentication experience with login, register, and forgot-password pages, mock localStorage auth, protected routes, and connected app flow from landing → auth → dashboard.

**Phase 3** replaces mock authentication with real backend auth: FastAPI + SQLAlchemy + SQLite, bcrypt password hashing, JWT tokens (24h expiry), protected `/api/auth/me`, and frontend API integration.

**Phase 4** adds a real employee chat system with FastAPI message API, SQLAlchemy chat models, protected REST endpoints, and a premium Team Chat UI at `/chat` with channel sidebar, message bubbles, and composer.

**Phase 5** upgrades Team Chat to real-time WebSocket messaging with live delivery, typing indicators, online presence, connection status pills, and automatic reconnection — while keeping all REST chat APIs intact.

**Phase 6** adds a real AI workplace assistant with OpenAI API integration, protected `/api/ai/chat` endpoint, six enterprise prompt modes, graceful fallback when the API key is missing, and a premium ChatGPT-style UI at `/ai`.

**Phase 7** adds AI meeting summaries from team chat messages with structured decisions, action items, owners, and deadlines; protected summary API endpoints; summary history persistence; chat header integration; and a premium summaries UI at `/summaries`.

**Phase 8** adds a company knowledge base with document upload, text extraction, AI document summarization, AI document Q&A, searchable document library, and a premium knowledge base UI at `/knowledge`.

**Phase 8.6** adds Gmail API OTP email verification for login and password reset, premium branded security emails, OTP verification UI, and protected change-password flow.

**Phase 9** adds enterprise task management with Kanban boards, full task CRUD, priority/status/deadline tracking, AI task generation from project goals, and a premium tasks UI at `/tasks`.

**Phase 10** adds an admin analytics dashboard with protected analytics API endpoints, enterprise KPI cards, productivity/AI/chat/document/security insights, recent activity timeline, and a premium analytics UI at `/analytics`.

**Phase 11** adds admin user management with role-based access control (employee, manager, admin, super_admin), user list and profile management, activate/deactivate users, role assignment, admin-protected routes, a premium admin users UI at `/admin/users`, and a profile page at `/profile`.

**Phase 12** adds enterprise notifications and audit logging with a notification center in the topbar, reusable audit/notification services, protected notification APIs, admin audit log APIs, security event tracking, read/unread notifications, and a premium audit logs UI at `/admin/audit-logs`.

**Phase 12.5** delivers full system QA and enterprise polish: signup OTP with role selection, premium OTP waiting room, role-based navigation, meeting video upload + Whisper transcription, export system (TXT/MD/JSON/PDF), upgraded AI prompt service, global design system components, presence API, Teams-style chat upgrades, ComingSoonModal for future features, and comprehensive bug fixes across all routes.

**Phase D5** completes AI Meeting Intelligence at `/meetings` with upload, Whisper transcription, multilingual detection, structured summaries/decisions/action items, AI Q&A, and full export support. Adds universal `ExportMenu` across meetings, AI assistant, knowledge base, summaries, tasks, and analytics (TXT/MD/JSON/CSV/PDF). Upgrades all AI prompt modes including new `chat_summary`. Performs a full bug-fix pass — zero TypeScript errors, zero backend import errors, all routes and buttons verified. See `docs/D5_MEETING_INTELLIGENCE_AND_QA_REPORT.md`.

## Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Lucide React |
| Backend  | FastAPI, Python, Uvicorn, Pydantic, SQLAlchemy, SQLite, python-jose, passlib |

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173  
Login: http://localhost:5173/login  
Dashboard: http://localhost:5173/dashboard (requires sign-in)  
Team Chat: http://localhost:5173/chat (requires sign-in)  
AI Assistant: http://localhost:5173/ai (requires sign-in)  
Meeting Summaries: http://localhost:5173/summaries (requires sign-in)  
Meetings: http://localhost:5173/meetings (requires sign-in)  
Knowledge Base: http://localhost:5173/knowledge (requires sign-in)  
Tasks: http://localhost:5173/tasks (requires sign-in)  
Analytics: http://localhost:5173/analytics (requires manager+ role)  
Admin Users: http://localhost:5173/admin/users (requires admin role)  
Profile: http://localhost:5173/profile (requires sign-in)  
Verify OTP: http://localhost:5173/verify-otp (login + signup flows)

See [docs/PHASE_12_5_FULL_QA_REPORT.md](docs/PHASE_12_5_FULL_QA_REPORT.md) for the complete Phase 12.5 QA report.

## Project Structure

```
├── backend/          # FastAPI API server
├── frontend/         # React + Vite SPA
├── docs/             # Project documentation
└── README.md
```

## Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Phase 0 Report](docs/PHASE_0_REPORT.md)
- [Phase 1 Report](docs/PHASE_1_REPORT.md)
- [Phase 2 Report](docs/PHASE_2_REPORT.md)
- [Phase 3 Report](docs/PHASE_3_REPORT.md)
- [Phase 4 Report](docs/PHASE_4_REPORT.md)
- [Phase 5 Report](docs/PHASE_5_REPORT.md)
- [Phase 6 Report](docs/PHASE_6_REPORT.md)
- [Phase 7 Report](docs/PHASE_7_REPORT.md)
- [Phase 8 Report](docs/PHASE_8_REPORT.md)
- [Phase 8.6 Report](docs/PHASE_8_6_REPORT.md)
- [Phase 9 Report](docs/PHASE_9_REPORT.md)
- [Phase 10 Report](docs/PHASE_10_REPORT.md)
- [Phase 11 Report](docs/PHASE_11_REPORT.md)
- [Phase 12 Report](docs/PHASE_12_REPORT.md)

## Phase 1 Highlights

- Premium dark dashboard at `/dashboard` with glassmorphism and gradient borders
- App shell: collapsible sidebar, topbar with search and notifications
- 8 dashboard sections powered by centralized mock data
- Reusable UI primitives: Button, Card, Badge, Input, Avatar, Progress
- Framer Motion page fade, card stagger, sidebar hover, and background glow animations

## Phase 2 Highlights

- Premium auth pages at `/login`, `/register`, `/forgot-password` with glassmorphism and animated feature side panel
- Mock localStorage authentication via `AuthContext` (login, register, demo workspace, logout)
- Protected `/dashboard` route with redirect to login when unauthenticated
- Sign out from sidebar user profile and topbar dropdown menu
- Landing page navbar links to auth flow; dashboard greeting uses authenticated user name

## Phase 3 Highlights

- Real backend authentication with FastAPI, SQLAlchemy, and SQLite (`aetherai.db`)
- JWT access tokens (24h expiry) with bcrypt password hashing
- Auth API: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Health endpoint reports database connectivity at `GET /api/health`
- Frontend `api.ts` client with premium error handling and loading states
- Token validation on app start via `/api/auth/me`; protected routes require valid token
- CORS configured for `http://localhost:5173`

## Phase 4 Highlights

- Real backend chat API with `ChatChannel` and `ChatMessage` SQLAlchemy models
- Protected chat endpoints: list/create channels, list/send messages
- Auto-seeded default channels (`general`, `engineering`, `product`, `support`, `leadership`)
- Sample enterprise messages seeded in `general` channel on first load
- Premium Team Chat UI at `/chat` with glassmorphism, Framer Motion animations
- Channel sidebar with descriptions, last activity, and unread badges
- Message bubbles with sender name, role, avatar, and timestamps
- Message composer with Enter to send, Shift+Enter for newline
- Full API integration via `api.ts` with JWT Bearer auth and 401 redirect

## Phase 5 Highlights

- Real-time WebSocket chat at `ws://localhost:8000/ws/chat/{channel_id}?token={JWT}`
- `ConnectionManager` tracks connections, online users, and typing state per channel
- Live message delivery without page refresh; messages persisted to SQLite
- Typing indicators ("Priya is typing..." / "2 people are typing...")
- Online presence count with live glow indicator in chat header
- Connection status pill: Live / Connecting / Offline with auto-reconnect
- `useChatSocket` React hook with exponential backoff reconnection
- WebSocket-first send with REST API fallback when socket unavailable
- Message deduplication prevents duplicates from REST + WebSocket overlap
- JWT required for WebSocket connect; invalid tokens rejected with close code 1008

## Phase 6 Highlights

- OpenAI-powered AI assistant at `/ai` with premium ChatGPT-style enterprise UI
- Protected `POST /api/ai/chat` endpoint with JWT Bearer authentication
- Six AI modes: general, meeting summary, email writer, task planner, error explainer, policy helper
- Mode-specific system prompts for enterprise workflows
- Graceful fallback when `OPENAI_API_KEY` is not configured (backend does not crash)
- Prompt starter cards, animated thinking dots, copy response, and character-count composer
- Sidebar AI Assistant link with active state at `/ai`
- Full API integration via `sendAIMessage()` in `api.ts`

## Phase 7 Highlights

- AI meeting summaries generated from team chat channel messages
- `MeetingSummary` SQLAlchemy model with JSON decisions and action items
- Protected summary API: `POST /api/summaries/channel/{channel_id}`, `GET /api/summaries`, `GET /api/summaries/{summary_id}`
- Structured AI output: title, summary text, decisions, action items with owners and deadlines
- Summary history scoped to user's company
- Premium summaries UI at `/summaries` with glassmorphism cards and loading states
- Chat header **AI Summarize** button generates summary and navigates to detail view
- Copy summary button exports full formatted text
- Graceful fallback when `OPENAI_API_KEY` is not configured
- Sidebar **Summaries** link at `/summaries`

## Phase 8 Highlights

- Company knowledge base with document upload at `/knowledge`
- `CompanyDocument` SQLAlchemy model with extracted text and AI summary fields
- Protected document API: upload, list, detail, summarize, ask, delete
- Text extraction for PDF (pypdf), TXT, MD, and DOCX files
- Local file storage in `backend/uploads/documents/`
- AI document summarization and Q&A using OpenAI with graceful fallback
- Premium knowledge base UI with drag-and-drop upload, search, and detail panels
- Client-side search across title, description, file name, and extracted text
- Copy summary and Q&A answers; delete with confirmation
- Sidebar **Knowledge Base** link at `/knowledge`

## Phase 8.6 Highlights

- Gmail API OAuth email sending (no SMTP, no app passwords)
- OTP-required login: credentials validated first, JWT issued only after email OTP verification
- Password reset via OTP email with premium dark enterprise HTML templates
- `LoginOTP` model with bcrypt-hashed codes, single-use, expiry, and resend invalidation
- Auth API: `POST /api/auth/login` (otp_required), `verify-login-otp`, `resend-login-otp`, `forgot-password`, `reset-password`, `change-password`
- Premium OTP UI at `/verify-otp` with 6-box input, paste support, countdown timer, and resend
- Password reset at `/reset-password`; change password at `/change-password`
- Dev health check: `GET /api/health/email` (Gmail config status, no secrets exposed)

## Phase 9 Highlights

- Enterprise task management with Kanban board at `/tasks`
- `Task` SQLAlchemy model with status, priority, assignee, due date, and `ai_generated` flag
- Protected task API: list, create, detail, update, delete, generate, bulk create
- AI task planner converts project goals into structured tasks using OpenAI (`task_planner` mode)
- Graceful fallback sample tasks when `OPENAI_API_KEY` is not configured
- Premium task UI: glassmorphism Kanban, filters, modals, detail panel, Framer Motion animations
- Task cards show priority badge, due date, assignee initials, and AI-generated badge
- Sidebar **Tasks** link at `/tasks` with active state
- Company-scoped task access via creator's organization

## Phase 10 Highlights

- Admin analytics dashboard at `/analytics` with enterprise KPI cards and premium dark glassmorphism UI
- Protected analytics API: overview, productivity, AI usage, and security endpoints
- Real-time metrics from SQLite: users, messages, tasks, documents, summaries, AI-generated tasks
- Productivity section with task completion rate, status/priority breakdown, and circular score gauges
- AI usage panel with queries today, mode breakdown, and automation counts
- Chat activity panel with collaboration score and most active channel
- Document insights with upload/summary counts and knowledge base usage indicator
- Security insights showing OTP, Gmail API, OpenAI, and protected route status
- Recent activity timeline aggregating messages, tasks, documents, summaries, and security events
- Sidebar **Analytics** link at `/analytics` with active state
- Graceful loading states, error handling, and refresh without page reload

## Phase 11 Highlights

- Admin user management at `/admin/users` with RBAC (employee, manager, admin, super_admin)
- Protected user API: list users, get detail, update role, activate/deactivate, profile read/update
- `get_current_admin_user` and `get_current_super_admin_user` permission dependencies
- Premium admin UI: stats cards, user table, detail panel, role change modal, status toggle
- Access denied page for non-admin users attempting admin routes
- Profile page at `/profile` with edit form and security panel
- Sidebar Admin link (admin-only) and profile access from sidebar/topbar menus
- Inactive users blocked from protected API access

## Phase 12 Highlights

- Notification center in topbar with unread badge and glassmorphism dropdown
- Protected notification APIs: list, unread count, mark read, mark all read
- `Notification` model with types: security, task, chat, document, ai, system
- `AuditLog` model with actor, action, entity, metadata, and IP address
- Reusable `audit_service.log_action()` and `notification_service.create_notification()`
- Audit hooks on login OTP, password changes, role/status updates, documents, tasks, AI summaries
- Admin audit logs page at `/admin/audit-logs` with filters, security panel, and detail view
- Sidebar Audit Logs link (admin-only) and topbar admin shortcut

## License

Proprietary — AetherAI Enterprise Hub
