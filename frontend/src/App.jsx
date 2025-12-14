import React, { useState, useEffect } from 'react';
import ParticipantSelector from './components/ParticipantSelector';
import ScriptInput from './components/ScriptInput';
import ChatInterface from './components/ChatInterface'; // Import the new component
import VideoExporter from './components/VideoExporter'; // Import VideoExporter

function App() {
  const [participants, setParticipants] = useState(['You', 'Participant 2']); // Default participants
  const [messages, setMessages] = useState([]); // State to hold parsed messages
  const [showChat, setShowChat] = useState(false); // State to control when to show chat
  const [chatName, setChatName] = useState(''); // Custom chat name
  const [replayKey, setReplayKey] = useState(0); // Key to force ChatInterface re-render
  const [participantColors, setParticipantColors] = useState({}); // Stores colors for each participant

  // Define a color palette for other participants
  const COLORS_PALETTE = [
    'text-blue-600',
    'text-red-600',
    'text-purple-600',
    'text-yellow-700', // darker yellow for visibility
    'text-indigo-600',
    // Add more as needed
  ];

  // Assign colors to participants when the participant list changes
  useEffect(() => {
    const newColors = {};
    newColors[participants[0]] = 'text-green-700'; // 'You' is always green

    let colorIndex = 0;
    for (let i = 1; i < participants.length; i++) {
      const participant = participants[i];
      // Assign a color, cycling through the palette
      newColors[participant] = COLORS_PALETTE[colorIndex % COLORS_PALETTE.length];
      colorIndex++;
    }
    setParticipantColors(newColors);
  }, [participants]);


  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
    // When participants change, hide chat to re-evaluate input
    setShowChat(false); 
  };

  const handleScriptParsed = (parsedMessages) => {
    setMessages(parsedMessages);
    // Only show chat if there are valid messages
    setShowChat(parsedMessages.length > 0); 
    setReplayKey(prev => prev + 1); // Reset replay key to ensure fresh animation
  };

  const handleReplayAnimation = () => {
    setReplayKey(prev => prev + 1); // Increment key to force remount of ChatInterface
  };

  return (
    // Outer Desktop Container
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 relative font-sans">
      
      {/* Branding (Top Left) */}
      <div className="absolute top-8 left-8 flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity hidden md:flex">
        <img src="/logo.png" alt="WhatsApp Chat Simulator Logo" className="w-12 h-12" />
        <div>
          <h1 className="text-xl font-bold text-gray-700">WhatsApp Chat Simulator</h1>
          <p className="text-sm text-gray-500">Create realistic mockups instantly</p>
        </div>
      </div>

      {/* Mobile Device Simulator Container */}
      <div className="w-full max-w-md h-[850px] max-h-[90vh] bg-gray-100 flex flex-col shadow-2xl rounded-[30px] overflow-hidden border-[8px] border-gray-800 relative">
        
        {/* Header */}
        <header className="bg-whatsapp-green-dark p-3 flex items-center justify-between shadow-md text-white z-20">
          <div className="flex items-center flex-1 min-w-0">
            {/* Back Button */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 mr-1 transition-opacity duration-200 ${showChat ? 'opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none w-0'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              onClick={() => setShowChat(false)}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            
            {/* Avatar (Placeholder) - Only show in chat */}
            {showChat && (
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center text-gray-600 text-xs font-bold overflow-hidden">
                 {/* Simple default avatar icon or initial */}
                 <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-500">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                 </svg>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-lg font-semibold truncate">
                  {showChat ? (chatName || participants.filter(p => p !== 'You').join(', ')) : 'Chat Simulator'}
              </h1>
              {showChat && <p className="text-xs opacity-75 truncate">Online</p>}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4 ml-2">
              {/* Video Call */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {/* Voice Call */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {/* Menu */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
              </svg>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-0 bg-whatsapp-bg flex flex-col overflow-hidden relative z-10">
          {!showChat ? (
            <div className="p-4 overflow-y-auto h-full">
              <ParticipantSelector onParticipantsChange={handleParticipantsChange} onChatNameChange={setChatName} />
              <ScriptInput participants={participants} onScriptParsed={handleScriptParsed} />
            </div>
          ) : (
            <ChatInterface key={replayKey} messages={messages} participants={participants} participantColors={participantColors} />
          )}
        </main>
      </div>

      {/* Floating Buttons (Desktop View) */}
      {showChat && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-3">
            {/* Replay Animation Button */}
            <button
                onClick={handleReplayAnimation}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12v.622m15.356-2A8.001 8.001 0 0120 12v.622" />
                </svg>
                Replay Animation
            </button>
            {/* Video Exporter */}
            <VideoExporter script={messages} participants={participants} chatName={chatName} participantColors={participantColors} />
        </div>
      )}
      
    </div>
  );
}

export default App;
