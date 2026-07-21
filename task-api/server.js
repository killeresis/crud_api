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
        const result = await pool.query(
            'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
            [title]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Update an existing task
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const result = await pool.query(
            'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
            [title, completed, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
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