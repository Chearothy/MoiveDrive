import React, { useState, useEffect } from 'react';

export default function SharedView({ shareToken }) {
  const apiBase = import.meta.env.VITE_API_BASE || 'https://localhost:7001';
  const fileUrl = `${apiBase}/api/drive/share/${shareToken}`;

  // Helper to check if file is video by extension
  const isVideoFile = (filename) => {
    return /\.(mp4|webm|ogg|mov|mkv)$/i.test(filename);
  };

  return (
    <div className="shared-file-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Shared File Preview</h2>
      
      {/* HTML5 Video Player with Range Stream support */}
      <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <video 
          controls 
          width="100%" 
          preload="metadata"
          crossOrigin="anonymous"
          style={{ borderRadius: '8px', backgroundColor: '#000' }}
        >
          <source src={fileUrl} type="video/mp4" />
          <source src={fileUrl} type="video/webm" />
          Your browser does not support video playback.
        </video>
      </div>

      <div style={{ marginTop: '15px' }}>
        <a 
          href={fileUrl} 
          download 
          className="btn-download"
          style={{ padding: '10px 20px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
        >
          Download Video
        </a>
      </div>
    </div>
  );
}
