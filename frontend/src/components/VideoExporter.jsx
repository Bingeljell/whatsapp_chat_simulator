import React, { useState, useRef, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

function VideoExporter({ script, participants, chatName, participantColors }) {
  const [status, setStatus] = useState('idle'); // idle, queued, processing, completed, error
  const [queuePosition, setQueuePosition] = useState(null);
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState('720p');
  const [quality, setQuality] = useState('standard');
  
  const jobIdRef = useRef(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      jobIdRef.current = null; // Stop polling signal
    };
  }, []);

  const pollStatus = async (jobId) => {
    if (jobIdRef.current !== jobId) return; // Stop if cancelled or new job started

    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
      if (!response.ok) throw new Error("Network error checking status");
      
      const data = await response.json();

      if (data.status === 'queued') {
        setStatus('queued');
        setQueuePosition(data.position);
        setTimeout(() => pollStatus(jobId), 2000); // Poll again in 2s
      } else if (data.status === 'processing') {
        setStatus('processing');
        setQueuePosition(null);
        setTimeout(() => pollStatus(jobId), 2000); // Poll again in 2s
      } else if (data.status === 'completed') {
        setStatus('completed');
        handleDownload(jobId);
      } else if (data.status === 'error') {
        setStatus('error');
        setError(data.error || 'Rendering failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError("Lost connection to server.");
    }
  };

  const handleDownload = async (jobId) => {
    try {
      // Trigger download
      const response = await fetch(`${API_BASE_URL}/api/download/${jobId}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp-chat-${resolution}-${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setStatus('idle'); // Reset after success
    } catch (err) {
      setStatus('error');
      setError("Failed to download video file.");
    }
  };

  const handleExport = async () => {
    setStatus('initializing');
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          participants,
          chatName: chatName || "Chat Simulator",
          participantColors,
          resolution,
          quality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start render');
      }

      const data = await response.json();
      jobIdRef.current = data.jobId; // Store ID for poller
      
      // Set initial status to queued and display position
      setStatus('queued');
      setQueuePosition(data.position);
      
      // Start polling after a short delay to allow initial UI render
      setTimeout(() => pollStatus(data.jobId), 500);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.message);
    }
  };

  const renderButtonContent = () => {
    switch (status) {
      case 'initializing':
        return (
           <span className="flex items-center">Starting...</span>
        );
      case 'queued':
        return (
          <span className="flex items-center">
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Queue Position: #{queuePosition + 1}
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center">
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Rendering Video...
          </span>
        );
      case 'completed':
        return "Download Starting...";
      default:
        return (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Video (MP4)
          </>
        );
    }
  };

  const isBusy = status !== 'idle' && status !== 'error';

  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-lg">
      <h3 className="text-md font-semibold mb-3">Export Options</h3>
      
      {/* Resolution Selector */}
      <div className="mb-3 w-full">
        <label htmlFor="resolution" className="block text-gray-700 text-sm font-bold mb-1">
          Resolution:
        </label>
        <select
          id="resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          disabled={isBusy}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          <option value="720p">720p (HD Mobile)</option>
          <option value="1080p">1080p (Full HD Mobile)</option>
        </select>
      </div>

      {/* Quality Selector */}
      <div className="mb-4 w-full">
        <label htmlFor="quality" className="block text-gray-700 text-sm font-bold mb-1">
          Quality:
        </label>
        <select
          id="quality"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={isBusy}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          <option value="standard">Standard (Balanced)</option>
          <option value="high">High (Larger File)</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
      
      <button
        onClick={handleExport}
        disabled={isBusy}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all flex items-center ${isBusy ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {renderButtonContent()}
      </button>
      <p className="text-xs text-gray-500 mt-2">Server-side rendering enabled</p>
    </div>
  );
}

export default VideoExporter;