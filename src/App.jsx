import React, { useState } from 'react';
import ParticipantSelector from './components/ParticipantSelector';
import ScriptInput from './components/ScriptInput';
import ChatInterface from './components/ChatInterface'; // Import the new component

function App() {
  const [participants, setParticipants] = useState(['You', 'Participant 2']); // Default participants
  const [messages, setMessages] = useState([]); // State to hold parsed messages
  const [showChat, setShowChat] = useState(false); // State to control when to show chat

  const handleParticipantsChange = (newParticipants) => {
    setParticipants(newParticipants);
    // When participants change, hide chat to re-evaluate input
    setShowChat(false); 
  };

  const handleScriptParsed = (parsedMessages) => {
    setMessages(parsedMessages);
    // Only show chat if there are valid messages
    setShowChat(parsedMessages.length > 0); 
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-whatsapp-green-dark p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          {/* Back Button (Placeholder) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white mr-4 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {/* Contact Info */}
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-semibold">Chat Simulator</h1>
            <p className="text-white text-sm opacity-75">Online</p>
          </div>
        </div>
        {/* Menu (Placeholder) */}
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white ml-4 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 bg-whatsapp-bg flex flex-col">
        {!showChat ? (
          <>
            <ParticipantSelector onParticipantsChange={handleParticipantsChange} />
            <ScriptInput participants={participants} onScriptParsed={handleScriptParsed} />
          </>
        ) : (
          <ChatInterface messages={messages} participants={participants} />
        )}
      </main>
    </div>
  );
}

export default App;