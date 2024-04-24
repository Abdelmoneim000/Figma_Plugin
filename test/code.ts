// code.ts
figma.showUI(__html__, { width: 400, height: 600 });

let previousUploads: Record<string, string> = {};
let imageUrls: string[] = [];

interface RES extends Response {
  ok: boolean;
  status: number;
  text(): string;
}

figma.on('selectionchange', () => {
  figma.ui.postMessage({ type: 'selected-node', message: `http://localhost:3000/uploads/${figma.currentPage.selection[0]?.id.split(":").join("_")}`});
});

figma.ui.onmessage = async (msg: any) => {
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
      const response = await sendImageToServer(imageData, msg.format, node.id);
      const url = await (response as RES).text();
      imageUrls.push(url);

      if (imageUrls.length > 200) {
        imageUrls.shift();
      }

      figma.ui.postMessage({ type: 'imageUrls', data: imageUrls });
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: (err as Error).message });
    }
  }

  if (msg.type === 'get-selected-node') {
    const nodeId = figma.currentPage.selection[0]?.id;
    if (nodeId) {
      const isPreviouslyUploaded = previousUploads[nodeId] !== undefined;
      figma.ui.postMessage({ type: 'selected-node', nodeId, isPreviouslyUploaded });
    }
  }
};

async function saveImageLocally(node: any, imageData: Uint8Array, format: 'PNG' | 'JPG'): Promise<string> {
  const fileName = `${node.id}.${format.toLowerCase()}`;
  const filePath = `${figma.root.name}/${fileName}`;

  figma.createImage(imageData);
  return filePath;
}

async function deleteImageLocally(filePath: string) {
  await figma.clientStorage.deleteAsync(filePath);
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
  const imagePath = `uploads/${nodeId.split(":").join("_")}.${format.toLowerCase()}`;

  figma.ui.postMessage({ type: 'success', message: `http://localhost:3000/${imagePath}` })
  return response;
}
