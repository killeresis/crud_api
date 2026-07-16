const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies, for express to read json data from the client 
app.use(express.json());

//database 
const tasks = [
    { id: 1, title: "Set up the server", done: true },
    { id: 2, title: "Build read endpoints", done: false },
    { id: 3, title: "Ship to GitHub", done: false }
];
//stage 1 
app.get('/', (req, res) => {
    res.json({ 
        name: "Task API", 
        version: "1.0", 
        endpoints: ["/tasks"] 
    });
});
app.get('/health', (req, res) => {
    res.json({ status: "ok" });
});

//stage 2 
app.get('/tasks', (req, res) => {
    res.json(tasks);
});
app.get('/tasks/:id', (req, res) => {
    // The ':id' in the URL is a parameter. We extract it and parse it as an integer.
    const requestedId = parseInt(req.params.id);
    
    // Search our array for a task that matches the ID
    const task = tasks.find(t => t.id === requestedId);

    if (task) {
        // If found, return it
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

// Start listening
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});