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

    // 1. Validate the input (The server never trusts the client)
    if (!title || title.trim() === '') {
        // Return 400 Bad Request if title is missing
        return res.status(400).json({ error: "Title is required and cannot be empty" });
    }

    // 2. Generate the next free ID 
    const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    // 3. Construct the new task
    const newTask = {
        id: nextId,
        title: title,
        done: false // Default to false
    };

    // 4. Add it to the array
    tasks.push(newTask);

    // 5. Return 201 Created and send the newly created task back
    res.status(201).json(newTask);
});
//stage 4 
// Update an existing task
app.put('/tasks/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === requestedId);

    // 1. Check if task exists
    if (!task) {
        return res.status(404).json({ error: `Task ${requestedId} not found` });
    }

    const { title, done } = req.body;

    // 2. Validate input (must have a body, title cannot be empty if provided)
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Request body cannot be empty" });
    }
    if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ error: "Title cannot be empty" });
    }

    // 3. Mutate the state (Update fields)
    if (title !== undefined) task.title = title;
    if (done !== undefined) task.done = done;

    // 4. Return the updated task with a 200 OK
    res.json(task);
});
//delete a task
app.delete('/tasks/:id', (req, res) => {
    const requestedId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === requestedId);

    // 1. Check if task exists
    if (taskIndex === -1) {
        return res.status(404).json({ error: `Task ${requestedId} not found` });
    }

    // 2. Remove the task from the array
    tasks.splice(taskIndex, 1);

    // 3. Return 204 No Content (Successful, but no data to send back)
    res.status(204).send();
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server is running!`);
    console.log(`-> API Root: http://localhost:${PORT}/`);
    console.log(`-> Swagger UI: http://localhost:${PORT}/docs`);
});