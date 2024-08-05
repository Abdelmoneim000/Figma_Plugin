figma.showUI(__html__, { width: 400, height: 600 });

let previousUploads: Record<string, string> = {};
let imageUrls: string[] = [];

interface RES extends Response {
  ok: boolean;
  status: number;
  text(): Promise<string>;
  json(): Promise<{
    result: {
      id: string;
      filename: string;
      uploaded: string;
      requireSignedURLs: boolean;
      variants: string[];
    };
  }>;
}
figma.on('selectionchange', () => {
  let selection = figma.currentPage.selection[0];
  console.log(selection.id);
  figma.ui.postMessage({ type: 'selected-node', isPreviouslyUploaded: figma.clientStorage.getAsync(`${selection ? selection.id : ""}`) ? true : false });
  console.log(figma.clientStorage.getAsync(`${selection?.id}`));
});

figma.on('documentchange', (event) => {
  for (const change of event.documentChanges) {
    switch (change.type) {
      case 'DELETE':
        if (previousUploads[change.node.id]) {
          deleteImageLocally(previousUploads[change.node.id]);
          delete previousUploads[change.node.id];
          figma.clientStorage.deleteAsync(change.node.id);
        }
        break;
      default:
        break;
    }
  }
});

figma.ui.onmessage = async (msg: any) => {
  if (msg.type === 'upload') {
    try {
      const node = figma.currentPage.selection[0];
      console.log()
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
      const imageUrl = await response.text();
      imageUrls.push(imageUrl);

      if (imageUrls.length > 200) {
        imageUrls.shift();
      }
      figma.clientStorage.deleteAsync('imageUrls');
      figma.clientStorage.setAsync('imageUrls', imageUrls);
      figma.ui.postMessage({ type: 'imageUrls', data: imageUrls });
    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: (err as Error).message });
    }
  }

  if (msg.type === 'get-selected-node') {
    const nodeId = figma.currentPage.selection[0]?.id;
    if (nodeId) {
      const isPreviouslyUploaded = previousUploads[nodeId] !== undefined;
      console.log(isPreviouslyUploaded);
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
  }) as RES;
  figma.clientStorage.setAsync(`${nodeId}`, nodeId);
  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }

  return response;
}
