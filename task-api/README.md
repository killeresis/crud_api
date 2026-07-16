# Task API
A simple, in-memory CRUD API for managing tasks.

## How to Run
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone this repository.
3. Install dependencies: `npm install`
4. Start the server: `node server.js`
5. The API will be available at `http://localhost:3000`.

## Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | / | API information |
| GET | /health | Server health check |
| GET | /tasks | List all tasks |
| GET | /tasks/:id | Get a specific task |
| POST | /tasks | Create a new task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Remove a task |

## Example Request
`curl -i http://localhost:3000/`