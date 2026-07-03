# AetherAI Enterprise Hub — Backend

FastAPI backend for the AetherAI Enterprise Hub platform.

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs  
Health: http://localhost:8000/api/health

## Structure

- `app/main.py` — FastAPI application entry point
- `app/core/config.py` — Settings and configuration
- `app/api/routes/` — API route handlers
- `app/models/` — SQLAlchemy models (Phase 1)
- `app/schemas/` — Pydantic schemas (Phase 1)
- `app/services/` — Business logic (Phase 1)
