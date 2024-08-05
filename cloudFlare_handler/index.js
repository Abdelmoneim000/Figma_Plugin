const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const cors = require('cors');
const bodyParser = require('body-parser');
const FormData = require('form-data');
const { Readable } = require('stream');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize express app
const app = express();
app.use(cors()); // Use cors middleware
app.use(bodyParser.raw({ type: 'image/*', limit: '50mb' }));

// Helper function to convert a buffer to a stream
function bufferToStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
}

// Create a POST route for file upload
app.post('/upload', async (req, res) => {
  if (!req.body) {
    console.log('No file uploaded');
    return res.status(400).send('No file uploaded');
  }

  const imageData = req.body;
  const nodeId = req.headers['x-node-id'];
  const format = req.headers['x-image-format'];
  const authorizationToken = `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`;

  // Save the file locally
  const fileName = `${nodeId.split(":").join("_")}.${format.toLowerCase()}`;
  console.log(fileName, format);
  const filePath = path.join(__dirname, 'uploads', fileName);

  fs.writeFileSync(filePath, imageData);

  // Create a form data to send to Cloudflare
  const formData = new FormData();
  const stream = bufferToStream(imageData);
  formData.append('file', stream, fileName);

  try {
    // Upload the image to Cloudflare
    const response = await fetch(process.env.URL, {
      method: 'POST',
      headers: {
        'Authorization': authorizationToken,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const result = await response.json();
    const imageUrl = result.result.variants[0]; // Assuming the first variant is the URL you need
    console.log(`Image uploaded to Cloudflare: ${imageUrl}`);

    // Send the local file path and image URL back to the Figma plugin
    res.status(200).send(imageUrl);
  } catch (err) {
    console.error('Error uploading to Cloudflare:', err);
    res.status(500).send('Error uploading to Cloudflare');
  }
});

// Create the uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
