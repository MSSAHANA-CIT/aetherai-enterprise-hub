# Deployment

## Railway Backend

### Required environment variables

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | Set to `production` |
| `DATABASE_URL` | PostgreSQL connection string for the backend service |
| `SECRET_KEY` | JWT signing secret |

### PostgreSQL connection string

The backend reads `DATABASE_URL` only. Do not hardcode Railway hostnames in application code.

**Private networking (default):**

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

This uses Railway's internal hostname (for example `postgres.railway.internal`). It works when private networking is enabled and resolving correctly between your backend and Postgres services.

**Public URL fallback:**

If the backend crashes at startup with:

```text
psycopg2.OperationalError: could not translate host name "postgres.railway.internal" to address
```

private networking is not resolving. Set the backend `DATABASE_URL` to the Postgres plugin's public connection string:

```text
DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}
```

In the Railway dashboard: open your **Postgres** service → **Connect** → copy **Public Network** URL → paste it into the backend service variable `DATABASE_URL`, or reference `${{Postgres.DATABASE_PUBLIC_URL}}`.

### Startup logs

On boot the backend prints safe diagnostics (no credentials or full URL):

```text
DATABASE_URL present: True
Database driver: PostgreSQL
Database host type: private/internal
```

or

```text
Database host type: public/external
```

Use `Database host type` to confirm which connection mode is active after changing variables.

### Local development

When `ENVIRONMENT` is not `production` and `DATABASE_URL` is unset, the backend falls back to SQLite (`sqlite:///./aetherai.db`). Production deployments must always set `DATABASE_URL`.

## Railway Frontend

### Required environment variable

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full URL of the deployed backend (no trailing slash), e.g. `https://your-backend.up.railway.app` |

**This must be set on the frontend service before `npm run build`.** Vite bakes it into the bundle at build time. If missing, the app calls `http://localhost:8000` in production and register/login will fail with a generic or connection error.

After setting the variable, trigger a **new deploy** of the frontend service.

### Verify

Open browser DevTools → Console. You should see:

```text
[AetherAI API] Base URL: https://your-backend.up.railway.app
```

Then check backend health:

```text
https://your-backend.up.railway.app/api/health/email
```

All email fields should be `true` before register/login will work.

### PostgreSQL driver

`backend/requirements.txt` includes `psycopg2-binary` for SQLAlchemy PostgreSQL connections on Railway. Redeploy after changing dependencies so the build installs the driver.
