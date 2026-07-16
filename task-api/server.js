const express = require('express');
const app = express();
const PORT = 3000;

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

// Start listening
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});