import React, { useState } from 'react';

function VideoExporter({ script, participants, chatName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState('720p'); // Default to 720p
  const [quality, setQuality] = useState('standard'); // Default to standard

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          participants,
          chatName: chatName || "Chat Simulator",
          resolution, // Pass selected resolution
          quality,    // Pass selected quality
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to render video');
      }

      // Convert response to Blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp-chat-${Date.now()}-${resolution}-${quality}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      setError('Error exporting video: ' + err.message + ' Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

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
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="standard">Standard (Balanced)</option>
          <option value="high">High (Larger File)</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
      <button
        onClick={handleExport}
        disabled={loading}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Rendering Video...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Video (MP4)
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 mt-2">Requires backend running on port 8000</p>
    </div>
  );
}

export default VideoExporter;
