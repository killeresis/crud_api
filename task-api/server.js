const Database = require('better-sqlite3');

// This opens tasks.db If it doesn't exist, SQLite creates it automatically!
const db = new Database('tasks.db');
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies, for express to read json data from the client 
app.use(express.json());
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./openapi.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



//database 
// 1. Create the table if it does not already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    title TEXT,
    done INTEGER
  )
`);

// 2. Check how many rows are currently in the table
const rowCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get();

// 3. Seed the data ONLY if the table is empty
if (rowCount.count === 0) {
  const insertTask = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  
  // Storing booleans as 1 (true) and 0 (false)
  insertTask.run("Set up the server", 1);
  insertTask.run("Build read endpoints", 0);
  insertTask.run("Ship to GitHub", 0);
  
  console.log("Seeded database with initial tasks.");
}
//stage 1 
app.get('/', (req, res) => {
  const statement = db.prepare('SELECT * FROM tasks');
  const tasks = statement.all();
  
  // Send the result back as JSON
  res.json(tasks);
});
app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

//stage 2 
app.get('/tasks', (req, res) => {
    const statement = db.prepare('SELECT * FROM tasks');
  const tasks = statement.all();
  
    res.json(tasks);
});
app.get('/tasks/:id', (req, res) => {
    // Extract and parse the ID
    const requestedId = parseInt(req.params.id);
    
    // Replace the old array search with a database query!
    // We use '?' to securely pass the ID and prevent SQL injection
    const statement = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = statement.get(requestedId);

    if (task) {
        // If found in the database, return it
        res.json(task);
    } else {
        // If not found, return a strict 404 status code with an error message
        res.status(404).json({ error: `Task ${requestedId} not found` });
    }
});

//stage 3 

// Create a new task
app.post('/tasks', (req, res) => {
    const { title } = req.body;

    // 1. Validate — missing/empty title still returns 400 (same as Assignment 1)
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: "Title is required and cannot be empty" });
    }

    // 2. Insert with parameterized query; DB assigns id; done defaults to false (0)
    const statement = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const info = statement.run(title, 0);

    // 3. Return 201 with the full new task (including the id the database gave it)
    const newTask = {
        id: Number(info.lastInsertRowid),
        title: title,
        done: false
    };
    res.status(201).json(newTask);
});
// Update an existing task
app.put('/tasks/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    const { title, done } = req.body;

    // 1. Validate input (same rules as Assignment 1)
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }
    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ error: "Title cannot be empty" });
    }

    // 2. Load the existing row first (needed for partial updates + 404)
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(requestedId);
    if (!existing) {
        return res.status(404).json({ error: "Task not found" });
    }

    const newTitle = title !== undefined ? title : existing.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

    // 3. Update with parameterized query
    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?')
      .run(newTitle, newDone, requestedId);

    // 4. Return the updated task
    res.json({
        id: requestedId,
        title: newTitle,
        done: Boolean(newDone)
    });
});

//delete a task
// Delete a task
app.delete('/tasks/:id', (req, res) => {
    // 1. Prepare the SQL statement
    const statement = db.prepare('DELETE FROM tasks WHERE id = ?');
    
    // 2. Run it using just the ID
    const info = statement.run(req.params.id);
    
    // 3. Check if anything was actually deleted
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({ message: "Task successfully deleted" });
});

  

// Start listening
app.listen(PORT, () => {
    console.log(`Server is running!`);
    console.log(`-> API Root: http://localhost:${PORT}/`);
    console.log(`-> Swagger UI: http://localhost:${PORT}/docs`);
});