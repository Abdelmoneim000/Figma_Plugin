import React, { useState, useEffect } from 'react';
import '../styles/ui.css';

const App: React.FC = () => {
  const [format, setFormat] = useState('PNG');
  const [previousUploads, setPreviousUploads] = useState<string[]>([]);
  const [uploadButtonText, setUploadButtonText] = useState('Upload');

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [previousUploads]);

  const handleMessage = (event: MessageEvent) => {
    const { type, message, nodeId, isPreviouslyUploaded, data } = event.data.pluginMessage;
    console.log(event.data.pluginMessage);
    console.log(nodeId)
    switch (type) {
      case 'success':
        updateArray(message);
        updatePreviousUploadsDisplay(data);
        break;
      case 'error':
        alert(message);
        break;
      case 'selected-node':
        setUploadButtonText(isPreviouslyUploaded ? 'Update' : 'Upload');
        break;
      case 'imageUrls':
        updateArray(message);
        updatePreviousUploadsDisplay(data);
        console.log(data);
        break;
      default:
        break;
    }
  };

  const updateArray = (newUrl: string) => {
    if (!previousUploads.includes(newUrl)) {
      setPreviousUploads((prevUploads) => [...prevUploads, newUrl]);
    }
  };

  const updatePreviousUploadsDisplay = (data) => {
    setPreviousUploads((prevUploads) => [...prevUploads, ...data]);
  };

  const getSelectedNode = async () => {
    parent.postMessage({ pluginMessage: { type: 'get-selected-node' } }, '*');
  };

  const handleUploadClick = async () => {
    await getSelectedNode();
    parent.postMessage({ pluginMessage: { type: 'upload', format } }, '*');
  };

  return (
    <div className="App">
      <h1>S3 Image Uploader</h1>
      <button onClick={handleUploadClick}>{uploadButtonText}</button>
      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="PNG">PNG</option>
        <option value="JPG">JPG</option>
      </select>
      <h2>Previous Uploads</h2>
      <ul>
        {previousUploads.map((url, index) => (
          <li key={index}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
