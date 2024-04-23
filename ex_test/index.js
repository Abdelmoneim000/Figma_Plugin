const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
app.use(cors()); // Use cors middleware
app.use(bodyParser.raw({ type: 'image/*', limit: '50mb' }));

// Create a POST route for file upload
app.post('/upload', (req, res) => {
  if (!req.body) {
    console.log('No file uploaded');
    return res.status(400).send('No file uploaded');
  }

  const imageData = req.body;
  const nodeId = req.headers['x-node-id'];
  const format = req.headers['x-image-format'];
  const imagePath = `uploads/${nodeId.split(":").join("_")}.${format.toLowerCase()}`;

  try {
    fs.writeFileSync(imagePath, imageData);
    console.log(`Image saved at ${imagePath}`);
    res.status(200).send(`http://localhost:3000/${imagePath}`);
  } catch (err) {
    console.error('Error saving file:', err);
    res.status(500).send('Error saving file');
  }
});

// Create a GET route to serve the uploaded files
app.get('/uploads/:path', (req, res) => {
  const path = req.params.path;
  res.sendFile(path, { root: __dirname + '/uploads' });
});

// Create the uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
}); 