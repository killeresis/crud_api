const express = require('express');
const app = express();
const PORT = 3000;

// The Hello World endpoint
app.get('/', (req, res) => {
    res.send('Hello, server is running!');
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});