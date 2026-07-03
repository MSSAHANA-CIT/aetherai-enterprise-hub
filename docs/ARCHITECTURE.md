# Architecture — AetherAI Enterprise Hub

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│              React SPA — localhost:5173                    │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP / REST
                          │ (Vite proxy: /api → :8000)
┌─────────────────────────▼───────────────────────────────┐
│                   FastAPI Backend                        │
│              Uvicorn — localhost:8000                    │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ Routes  │→ │ Services │→ │  Models  │→ │   DB    │  │
│  │ (API)   │  │ (Logic)  │  │ (ORM)    │  │ (Future)│  │
│  └─────────┘  └──────────┘  └──────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router registration
│   ├── core/
│   │   └── config.py        # Settings via pydantic-settings
│   ├── api/
│   │   └── routes/
│   │       └── health.py    # Health check endpoint
│   ├── models/              # SQLAlchemy ORM models (Phase 1)
│   ├── schemas/             # Pydantic request/response schemas (Phase 1)
│   └── services/            # Business logic layer (Phase 1)
└── requirements.txt
```

### API Response Format

All endpoints return a consistent envelope:

```json
{
  "status": "success",
  "message": "Human-readable message",
  "data": { }
}
```

Error responses will follow the same pattern with `"status": "error"` in Phase 1.

### Configuration

Settings are managed via `pydantic-settings` in `app/core/config.py`:

- `app_name`, `app_version` — application metadata
- `cors_origins` — allowed frontend origins
- `database_url` — placeholder for Phase 1

### CORS

CORS middleware allows requests from the Vite dev server (`localhost:5173`). Production origins will be added via environment variables.

## Frontend Architecture

### Directory Structure

```
frontend/
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Router provider
│   ├── index.css            # Tailwind + custom utilities
│   ├── routes/
│   │   └── index.tsx        # React Router config
│   ├── layouts/
│   │   └── MainLayout.tsx   # Page layout wrapper
│   ├── pages/
│   │   ├── LandingPage.tsx  # Main landing page
│   │   └── DashboardPreview.tsx
│   ├── components/
│   │   ├── ui/              # Reusable primitives
│   │   └── landing/         # Landing page sections
│   └── lib/
│       └── utils.ts         # cn() helper (clsx + tailwind-merge)
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### Routing

React Router v7 with a layout-based structure. Phase 0 has a single route (`/`). Future phases will add:

- `/login`, `/register` — authentication
- `/dashboard` — authenticated workspace
- `/chat`, `/tasks`, `/knowledge` — feature modules

### Styling

- **Tailwind CSS** for utility-first styling
- Custom utilities in `index.css`: `.glass`, `.gradient-border`, `.text-gradient`, `.glow-orb`
- Extended theme in `tailwind.config.js`: `aether` color palette, `surface` backgrounds, custom shadows

### Animations

Framer Motion is used for:

- Page entrance animations (fade + slide)
- Staggered grid reveals on scroll (`whileInView`)
- Navbar scroll state transitions

### API Proxy

Vite dev server proxies `/api` requests to `http://localhost:8000`, avoiding CORS issues during development.

## Data Flow (Future Phases)

```
User Action → React Component → API Service → FastAPI Route
    → Service Layer → SQLAlchemy Model → PostgreSQL
    → Response → Pydantic Schema → JSON → React State → UI Update
```

## Security (Planned)

| Concern | Approach |
|---------|----------|
| Authentication | JWT tokens with refresh rotation |
| Authorization | Role-based access (employee, manager, admin) |
| API validation | Pydantic schemas on all inputs |
| CORS | Environment-specific origin allowlists |
| Secrets | `.env` files, never committed |

## Deployment (Future)

| Component | Suggested Platform |
|-----------|-------------------|
| Frontend | Vercel, Netlify, or S3 + CloudFront |
| Backend | Railway, Render, or AWS ECS |
| Database | PostgreSQL (Supabase, RDS, or Neon) |
| AI | OpenAI / Anthropic API with RAG pipeline |

## Why This Structure?

- **Separation of concerns** — frontend and backend run independently
- **Scalable folders** — models, schemas, services ready for growth
- **Consistent API contract** — response envelope from day one
- **Component-driven UI** — reusable primitives before feature pages
- **Documentation-first** — every phase documented for continuity
