const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the web-build directory
app.use(express.static(path.join(__dirname, 'web-build')));

// All other requests go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});