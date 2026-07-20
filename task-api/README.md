# FlyRank Task API (SQLite Migration)

## Overview
A backend REST API for managing tasks. CRUD used to live in an in-memory array (Assignment 1). This version stores the same data in SQLite, so tasks survive a server restart. Endpoints and response shapes stay the same — only the storage layer changed.

## Why SQLite?
SQLite is a single file on disk with zero setup: no separate database server to install or run. Opening `tasks.db` creates the file if it is missing. That makes it a good fit for this project — data persists across restarts, and anyone who clones the repo gets a working database on first run without extra config.

## Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite (`better-sqlite3`)

## Where the database lives
* File: `task-api/tasks.db`
* Created automatically the first time you start the server
* Git-ignored so each clone starts fresh (table + three seeded tasks on first run)

## Run the project
From the `task-api` folder:

```bash
npm install
node server.js
```

Then open:
* API: http://localhost:3000/tasks
* Docs: http://localhost:3000/docs

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List all tasks |
| GET | `/tasks/:id` | Get one task (404 if missing) |
| POST | `/tasks` | Create a task (`title` required) → 201 |
| PUT | `/tasks/:id` | Update title and/or done |
| DELETE | `/tasks/:id` | Delete a task → 204 |

## Example SQL (Stage 4)
Run in DB Browser for SQLite → Execute SQL:

```sql
SELECT * FROM tasks WHERE done = 1;
```

This returns only completed tasks (`done = 1`). After changing rows in DB Browser, `GET /tasks` shows the same data — API and DB Browser share one file.

## DB Browser screenshot
The `tasks` table in DB Browser for SQLite (three seeded rows after a fresh start):

![tasks.db in DB Browser](docs/db-browser-screenshot.png)
