# FlyRank Task API (Containerized Postgres)

## What this is
A REST CRUD API for tasks. Storage evolved across three assignments:

| Assignment | Storage |
|---|---|
| A1 | In-memory array |
| A2 | SQLite file (`tasks.db`) |
| A3 (this) | PostgreSQL in Docker |

Endpoints and response shapes stay the same — only the storage layer changed.

## Tech stack
* **Runtime:** Node.js + Express
* **Database:** PostgreSQL 16 (`pg` driver)
* **Containers:** Docker + Docker Compose

## One command to run everything
From the `task-api` folder, with Docker Desktop running:

```bash
cp .env.example .env
docker compose up --build
```

Then open:
* API: http://localhost:3000/tasks
* Docs: http://localhost:3000/docs

Stop: `docker compose down`  
Data survives restarts via the `taskdata` volume.

## Environment variables
Copy `.env.example` → `.env` (`.env` is git-ignored — never commit real secrets).

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:dev@localhost:5432/tasks` | Local API → local Postgres |
| `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | From Supabase → Project Settings → API |
| `SUPABASE_KEY` | `your_anon_key` | Use the **anon / publishable** key only |
| `PORT` | `3000` | API port |
| (Compose) | `DATABASE_URL` set in `compose.yaml` as `...@db:5432/tasks` | Inside Docker the host is **`db`**, not `localhost` |

## Auth endpoints (A4)
| Method | Path | Auth? | Description |
|---|---|---|---|
| POST | `/auth/signup` | no | Create account → 201 |
| POST | `/auth/login` | no | Returns `access_token` + `refresh_token` → 200 |
| POST | `/auth/logout` | Bearer JWT | End session → 204 |
| GET | `/public/info` | no | Public welcome message → 200 |
| GET | `/protected/profile` | Bearer JWT | Current user metadata → 200 |
| GET | `/protected/dashboard` | Bearer JWT | Second protected door (same middleware) → 200 |

## Task endpoints
| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get one task | 200 / 404 |
| POST | `/tasks` | Create a task (`title` required) | 201 / 400 |
| PUT | `/tasks/:id` | Update `title` and/or `done` | 200 / 400 / 404 |
| DELETE | `/tasks/:id` | Delete a task | 204 / 404 |

## Swagger UI (Authorize padlock)
Open http://localhost:3000/docs

1. `POST /auth/login` → copy `access_token`
2. Click **Authorize** (lock icon) → paste the token → Authorize
3. Try `GET /protected/profile` — should return **200**

Protected routes (`/protected/*`, `/auth/logout`) show a lock icon in Swagger.

![Swagger UI with bearer auth](docs/swagger-auth-screenshot.png)

## Example `curl -i`
```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 207
Date: Tue, 21 Jul 2026 11:18:41 GMT
Connection: keep-alive

[{"id":1,"title":"Set up the server","done":true},{"id":2,"title":"Build read endpoints","done":false},{"id":3,"title":"Ship to GitHub","done":false},{"id":4,"title":"Compose persistence test","done":false}]
```

Command used:

```bash
curl -i http://localhost:3000/tasks
```

## Data in Postgres (`psql`)
Screenshot of `\dt` and `SELECT * FROM tasks;` inside the Compose `db` container:

![Postgres tasks table in psql](docs/postgres-screenshot.png)

Inspect yourself with:

```bash
docker compose exec db psql -U postgres -d tasks
```

Then run `\dt` and `SELECT * FROM tasks;`.

## Project layout
* `server.js` — Express routes
* `db.js` — Postgres repository (connect, create table, seed once)
* `middleware/auth.js` — reusable JWT guard (`requireAuth`)
* `supabase.js` — Supabase client
* `openapi.json` — Swagger spec with bearer auth
* `Dockerfile` / `compose.yaml` — containerized stack
* `.env.example` — template for secrets (committed)
* `.env` — real secrets (git-ignored)

## A2 note (SQLite)
Earlier stages used SQLite. A screenshot of that table in DB Browser is at [docs/db-browser-screenshot.png](docs/db-browser-screenshot.png). Current storage is Postgres via Compose.
