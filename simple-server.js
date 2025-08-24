const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle SPA routing - serve index.html for any unmatched routes
app.get('*', (req, res) => {
    // If the request is for a file with an extension, try to serve it
    if (path.extname(req.path)) {
        res.status(404).send('File not found');
    } else {
        // For routes without extensions, serve index.html (SPA routing)
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Tournament Management System running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from: ${__dirname}`);
    console.log(`💾 Using localStorage API - no database server required`);
});
