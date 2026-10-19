import React, { useState, useEffect } from 'react';
import './style.css';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:7001';

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [shareTokenInput, setShareTokenInput] = useState('');
  const [activeShareToken, setActiveShareToken] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch file list on initial load
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drive/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/drive/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setMessage('File uploaded successfully!');
        setSelectedFile(null);
        e.target.reset();
        fetchFiles();
      } else {
        setMessage('Upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion
  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/drive/files/${fileId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage('File deleted successfully.');
        fetchFiles();
      } else {
        setMessage('Failed to delete file.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('Error deleting file.');
    }
  };

  // Helper to check if file is a video
  const isVideo = (filename) => {
    return /\.(mp4|webm|ogg|mov|mkv)$/i.test(filename);
  };

  // Get share URL by token
  const getShareUrl = (token) => `${API_BASE}/api/drive/share/${token}`;

  return (
    <div className="app-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Drive File Manager</h1>

      {message && <div style={{ padding: '10px', background: '#e2e2e2', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}

      {/* --- SECTION 1: UPLOAD FORM --- */}
      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3>Upload File</h3>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="file" 
            onChange={(e) => setSelectedFile(e.target.files[0])} 
            required 
          />
          <button type="submit" disabled={uploading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </section>

      {/* --- SECTION 2: VIEW SHARED LINK DIRECTLY --- */}
      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3>View Shared File</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            type="text" 
            placeholder="Enter Share Token" 
            value={shareTokenInput}
            onChange={(e) => setShareTokenInput(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button 
            onClick={() => setActiveShareToken(shareTokenInput)} 
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Load Preview
          </button>
        </div>

        {activeShareToken && (
          <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', textAlign: 'center' }}>
            <h4>Previewing Shared Token: {activeShareToken}</h4>
            
            {/* Native Video Player supporting Range Streams */}
            <div style={{ maxWidth: '700px', margin: '15px auto' }}>
              <video 
                controls 
                width="100%" 
                preload="metadata"
                crossOrigin="anonymous"
                style={{ borderRadius: '6px', backgroundColor: '#000' }}
              >
                <source src={getShareUrl(activeShareToken)} type="video/mp4" />
                <source src={getShareUrl(activeShareToken)} type="video/webm" />
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            <a 
              href={getShareUrl(activeShareToken)} 
              download 
              style={{ display: 'inline-block', padding: '8px 16px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
            >
              Download File
            </a>
          </div>
        )}
      </section>

      {/* --- SECTION 3: MY FILES LIST --- */}
      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
        <h3>My Files</h3>
        {files.length === 0 ? (
          <p>No files found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '8px' }}>Filename</th>
                <th style={{ padding: '8px' }}>Share Token</th>
                <th style={{ padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>
                    {file.fileName} {isVideo(file.fileName) && '🎥'}
                  </td>
                  <td style={{ padding: '8px', fontSize: '0.9em', color: '#555' }}>
                    {file.shareToken || 'N/A'}
                  </td>
                  <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                    {file.shareToken && (
                      <button 
                        onClick={() => setActiveShareToken(file.shareToken)}
                        style={{ padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Play / View
                      </button>
                    )}
                    <a 
                      href={`${API_BASE}/api/drive/files/download/${file.id}`} 
                      download
                      style={{ padding: '4px 8px', background: '#28a745', color: '#fff', textDecoration: 'none', borderRadius: '3px', fontSize: '0.85em' }}
                    >
                      Download
                    </a>
                    <button 
                      onClick={() => handleDelete(file.id)}
                      style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
