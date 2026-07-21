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
| `DATABASE_URL` | `postgres://postgres:dev@localhost:5432/tasks` | For running the API **on your machine** against a local Postgres |
| (Compose) | set in `compose.yaml` as `postgres://postgres:dev@db:5432/tasks` | Inside Docker the host is the service name **`db`**, not `localhost` |

## Endpoints
| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get one task | 200 / 404 |
| POST | `/tasks` | Create a task (`title` required) | 201 / 400 |
| PUT | `/tasks/:id` | Update `title` and/or `done` | 200 / 400 / 404 |
| DELETE | `/tasks/:id` | Delete a task | 204 / 404 |

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
```text
\dt
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | tasks | table | postgres

SELECT * FROM tasks;
 id |          title           | done
----+--------------------------+------
  1 | Set up the server        | t
  2 | Build read endpoints     | f
  3 | Ship to GitHub           | f
  4 | Compose persistence test | f
```

Inspect yourself with:

```bash
docker compose exec db psql -U postgres -d tasks
```

## Project layout
* `server.js` — Express routes
* `db.js` — Postgres repository (connect, create table, seed once)
* `Dockerfile` — builds the API image
* `compose.yaml` — starts `api` + `db` together
* `.env.example` — template for secrets (committed)
* `.env` — real secrets (git-ignored)

## A2 note (SQLite)
Earlier stages used SQLite. A screenshot of that table in DB Browser is at [docs/db-browser-screenshot.png](docs/db-browser-screenshot.png). Current storage is Postgres via Compose.
