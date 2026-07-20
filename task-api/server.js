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
// stage 2 (or 3, depending on your assignment rubric!)
app.post('/tasks', (req, res) => {
    // 1. Prepare the SQL statement with placeholders
    const statement = db.prepare('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)');

    // 2. Run the statement with the actual values from req.body
    const info = statement.run(req.body.title, req.body.description, req.body.status || 'pending');

    // 3. Send a success response back to the client with the newly created task's ID
    res.status(201).json({ 
        message: "Task successfully created",
        id: info.lastInsertRowid 
    });
});
//stage 4 
// Update an existing task
app.put('/tasks/:id', (req, res) => {
    // 1. Prepare the SQL statement
    const statement = db.prepare('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?');
    
    // 2. Run it with values from the body, and the ID from the URL parameters
    const info = statement.run(req.body.title, req.body.description, req.body.status, req.params.id);
    
    // 3. 'info.changes' tells us how many rows were updated. If it's 0, the ID didn't exist!
    if (info.changes === 0) {
        return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({ message: "Task successfully updated" });
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