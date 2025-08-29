const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Route to test image access
app.get('/test-image', (req, res) => {
    res.sendFile(path.join(__dirname, '../image/banner.png'));
});

// Start the server
app.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}/test-image`);
});
