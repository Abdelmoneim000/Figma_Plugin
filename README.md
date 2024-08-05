# Figma Plugin React

![62862431-71537f00-bd0e-11e9-85db-d97c0fb729a4](https://user-images.githubusercontent.com/16322616/62862692-46b5f600-bd0f-11e9-93b0-75955d1de8f3.png)

This template contains the react example as shown on [Figma Docs](https://www.figma.com/plugin-docs/intro/), with some structural changes and extra tooling.

## Quickstart

- Run `yarn` to install dependencies.
- Run `yarn build:watch` to start webpack in watch mode.
- Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and choose `manifest.json` file from this repo.

⭐ To change the UI of your plugin (the react code), start editing [App.tsx](./src/app/components/App.tsx).  
⭐ To interact with the Figma API edit [controller.ts](./src/plugin/controller.ts).  
⭐ Read more on the [Figma API Overview](https://www.figma.com/plugin-docs/api/api-overview/).

## Setup and Start

### Prerequisites

- Node.js installed on your machine
- Figma account and Figma desktop app installed
- Basic knowledge of Figma plugins and Node.js

### Step 1: Clone the Repository

Clone the repository containing the plugin code to a local directory on your machine.

```sh
git clone https://github.com/Abdelmoneim000/Figma_Plugin.git
cd figma-plugin-react
```

### Step 2: Install Dependencies

In the cloned repository, run the command to install the required dependencies.

```sh
yarn
```

### Step 3: Build the Plugin

Run the command to start webpack in watch mode, which will build the plugin code.

> [!IMPORTANT]
> Create a `.env` file in the root of `cloudFlare_handler` directory and put your `CLOUDFLARE_API_TOKEN` & `URL` of your account to post the images before starting the app.

```sh
yarn build:watch
```

### Step 4: Load the Plugin in Figma

1. Open the Figma desktop app and create a new document or open an existing one.
2. Go to the Figma menu and select Plugins -> Development -> Import plugin from manifest....
3. Choose the manifest.json file from the cloned repository.

### Step 5: Start Using the Plugin

The plugin should now be loaded in Figma. You can start using it by selecting a node in your Figma document and clicking on the "Upload" button in the plugin UI.


## Plugin Description

### S3 Image Uploader

The S3 Image Uploader plugin for Figma allows users to upload images from their Figma designs to an S3 bucket. The plugin provides a simple and intuitive interface for selecting the image format (PNG or JPG) and uploading the image.


### Features

- Upload images from Figma designs to an S3 bucket
- Select image format (PNG or JPG)
- Display previous uploads in the plugin UI
- Update previously uploaded images


### How it Works

1. Select a node in your Figma document.
2. Click on the "Upload" button in the plugin UI.
3. Select the image format (PNG or JPG).
4. The plugin will upload the image to the S3 bucket.
5. The uploaded image URL will be displayed in the plugin UI.
6. Previously uploaded images can be updated by clicking on the "Update" button.

## Technical Details
The plugin uses the Figma API to interact with the Figma document and AWS S3 to handle the image uploads. The plugin communicates with the server using the fetch API and sends the image data as a binary payload. The server-side code uses Node.js and the AWS SDK to handle the upload request and save the image to an S3 bucket.

## Contributors

- [Abdel-Moneim Ibrahim](https://www.linkedin.com/in/abdel-moniem-ibrahim/) : Developer of This Plugin.
- [fardeem](https://github.com/fardeem) : Developer, Mainter and sponsor of this plugin.

-----