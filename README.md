# Setup and Start

## Prerequisites

  - Node.js installed on your machine
  - Figma account and Figma desktop app installed
  - Basic knowledge of Figma plugins and Node.js
  
### Step 1: Clone the Repository

Clone the repository containing the plugin code to a local directory on your machine.

### Step 2: Install Dependencies

In the cloned repository, navigate to the code.ts directory and run the command npm install to install the required dependencies.

### Step 3: Build the Plugin

Run the command npm run build to build the plugin code.

### Step 4: Start the Server

In the index.js directory, run the command npm run dev to start the server.

### Step 5: Load the Plugin in Figma

Open Figma desktop app and create a new document or open an existing one. Go to the Figma menu and select "Plugins" > "Manage Plugins". Click on the "Load Plugin" button and select the manifest.json file from the cloned repository.

### Step 6: Start Using the Plugin

The plugin should now be loaded in Figma. You can start using it by selecting a node in your Figma document and clicking on the "Upload" button in the plugin UI.

## Plugin Description

**S3 Image Uploader**
The S3 Image Uploader plugin for Figma allows users to upload images from their Figma designs to a local server. The plugin provides a simple and intuitive interface for selecting the image format (PNG or JPG) and uploading the image.

## Features

1. Upload images from Figma designs to a local server
2. Select image format (PNG or JPG)
3. Display previous uploads in the plugin UI
4. Update previously uploaded images

## How it Works

1. Select a node in your Figma document
2. Click on the "Upload" button in the plugin UI
3. Select the image format (PNG or JPG)
4. The plugin will upload the image to the local server
5. The uploaded image URL will be displayed in the plugin UI
6. Previously uploaded images can be updated by clicking on the "Update" button

## Technical Details

The plugin uses the Figma API to interact with the Figma document and Node.js to handle the server-side logic. The plugin communicates with the server using the fetch API and sends the image data as a binary payload. The server-side code uses Express.js to handle the upload request and save the image to a local directory.
