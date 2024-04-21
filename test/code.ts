// code.ts
figma.showUI(__html__, { width: 400, height: 600 });

let previousUploads: Record<string, string> = {};

interface RES extends Response {
  ok: boolean;
  status: number;
}

figma.ui.onmessage = async (msg: any) => {
  console.log(msg.type);
  if (msg.type === 'upload') {
    try {
      const node = figma.currentPage.selection[0];
      if (!node) {
        figma.ui.postMessage({ type: 'error', message: 'No node selected' });
        return;
      }

      const imageData = await node.exportAsync({ format: msg.format });
      const filePath = await saveImageLocally(node, imageData, msg.format);

      if (previousUploads[msg.nodeId]) {
        // Remove previous image file
        await deleteImageLocally(previousUploads[msg.nodeId]);
      }

      previousUploads[msg.nodeId] = filePath;
      figma.ui.postMessage({ type: 'uploads', data: previousUploads });

      // Send the image data to the server
      await sendImageToServer(imageData, msg.format, node.id);
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: (err as Error).message });
    }
  }
};

async function saveImageLocally(node: any, imageData: Uint8Array, format: 'PNG' | 'JPG'): Promise<string> {
  console.log('Saving node:', node);
  const fileName = `${node.id}.${format.toLowerCase()}`;
  const filePath = `${figma.root.name}/${fileName}`;

  figma.createImage(imageData);
  console.log(`Image saved locally at: ${filePath}`);
  return filePath;
}

async function deleteImageLocally(filePath: string) {
  await figma.clientStorage.deleteAsync(filePath);
  console.log(`Deleted image file at: ${filePath}`);
}

async function sendImageToServer(imageData: Uint8Array, format: 'PNG' | 'JPG', nodeId: string) {
  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `image/${format.toLowerCase()}`,
      'X-Node-Id': nodeId,
      'X-Image-Format': format,
    },
    body: imageData,
  });

  if (!(response as RES).ok) {
    throw new Error(`Server responded with status ${(response as RES).status}`);
  }

  console.log('Image sent to server successfully');
}