require('dotenv').config();

const { pool, initDb } = require('./db');

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies, for express to read json data from the client 
app.use(express.json());
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

//stage 2 — read from Postgres
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/tasks/:id', async (req, res) => {
    try {
        const requestedId = parseInt(req.params.id);

        // Parameterized query: pass the id separately, never glue it into the SQL
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [requestedId]);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Task not found" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//stage 3 

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const { title } = req.body;

        // Validate — missing/empty title → 400
        if (!title || title.trim() === '') {
            return res.status(400).json({ error: "Title is required and cannot be empty" });
        }

        // RETURNING * hands back the new row, id included; done defaults to false
        const result = await pool.query(
            'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
            [title, false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update an existing task
app.put('/tasks/:id', async (req, res) => {
    try {
        const requestedId = parseInt(req.params.id);
        const { title, done } = req.body;

        // Validate input (same rules as A1/A2)
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body cannot be empty" });
        }
        if (title !== undefined && title.trim() === '') {
            return res.status(400).json({ error: "Title cannot be empty" });
        }

        // Load existing row first (for partial updates + 404)
        const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [requestedId]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const current = existing.rows[0];
        const newTitle = title !== undefined ? title : current.title;
        const newDone = done !== undefined ? done : current.done;

        const result = await pool.query(
            'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
            [newTitle, newDone, requestedId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const requestedId = parseInt(req.params.id);
        const result = await pool.query('DELETE FROM tasks WHERE id = $1', [requestedId]);

        // Unknown id → 404
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // 204 No Content — success with an empty body
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Connect to Postgres, create table if needed, seed once — then start listening
async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server is running!`);
        console.log(`-> API Root: http://localhost:${PORT}/`);
        console.log(`-> Swagger UI: http://localhost:${PORT}/docs`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});