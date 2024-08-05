figma.showUI(__html__, { width: 500, height: 700 });

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

async function loadPreviousUploads() {
  try {
    const response = await fetch('http://localhost:3000/uploads-history');
    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    previousUploads = await response.json();
    figma.ui.postMessage({ type: 'uploads', data: previousUploads });
  } catch (err) {
    console.error('Error loading previous uploads:', err);
  }
}

figma.on('selectionchange', async () => {
  const selection = figma.currentPage.selection[0]?.id;
  const isPreviouslyUploaded = previousUploads[selection] ? true : false;
  figma.ui.postMessage({ type: 'selected-node', isPreviouslyUploaded, nodeId: selection });
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
        await deleteImageLocally(previousUploads[msg.nodeId]);
      }

      previousUploads[msg.nodeId] = filePath;
      figma.ui.postMessage({ type: 'uploads', data: previousUploads });

      const response = await sendImageToServer(imageData, msg.format, node.id);
      const imageUrl = await response.text();
      imageUrls.push(imageUrl);

      if (imageUrls.length > 200) {
        imageUrls.shift();
      }
      figma.ui.postMessage({ type: 'imageUrls', data: imageUrls });

      previousUploads[node.id] = imageUrl;

    } catch (err) {
      figma.ui.postMessage({ type: 'error', message: (err as Error).message });
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
  if (!response.ok) {
    throw new Error(`Server responded with status ${response.status}`);
  }
  return response;
}

// Load previous uploads on initialization
loadPreviousUploads();
