import React, { useState, useEffect, useRef } from 'react';

function ChatInterface({ messages, participants, participantColors }) { // Added participantColors
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [typingSender, setTypingSender] = useState(null); // New state to hold who is typing
  const chatBottomRef = useRef(null);

  // Reset displayed messages when new script is parsed
  useEffect(() => {
    setDisplayedMessages([]);
    setTypingSender(null); // Reset typing sender too
  }, [messages]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    let messageIndex = 0;
    let timer;

    const displayNextMessage = () => {
      if (messageIndex < messages.length) {
        const currentMessage = messages[messageIndex];
        const delay = Math.max(500, currentMessage.message.length * 50); // Simulate typing speed

        setTypingSender(currentMessage.sender); // Set who is typing
        timer = setTimeout(() => {
          setTypingSender(null); // Clear typing sender
          setDisplayedMessages((prev) => [...prev, currentMessage]);
          messageIndex++;
          // A small delay after message is "sent" before checking for next
          setTimeout(displayNextMessage, 1000); 
        }, delay);
      }
    };

    // Start displaying messages after a short initial delay
    const initialDelay = 1500; 
    const startTimer = setTimeout(displayNextMessage, initialDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(startTimer);
    };
  }, [messages]);

  // Scroll to bottom when new messages are added or typing indicator changes
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages, typingSender]); // Depend on typingSender too

  return (
    <div className="flex flex-col h-full bg-whatsapp-bg">
      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scrollbar-hide">
        {displayedMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex mb-2 items-start ${ // Added items-start for avatar alignment
                          participants[0] === msg.sender ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {! (participants[0] === msg.sender) && ( // Only show avatar for received messages
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-sm font-semibold text-gray-800 flex-shrink-0">
                            {msg.sender.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`px-3 py-2 rounded-lg shadow-sm max-w-[80%] break-words relative pb-5 ${
                            participants[0] === msg.sender
                              ? 'bg-whatsapp-bubble text-black rounded-tr-none'
                              : 'bg-white text-black rounded-tl-none'
                          }`}
                        >
                          {/* Always show sender name for simulation clarity */}              <span className={`font-bold text-sm block mb-1 ${participantColors[msg.sender]}`}>
                {msg.sender}
              </span>
              
              <p className="text-base leading-relaxed pr-2">{msg.message}</p>
              
              {/* Timestamp */}
              <span className="text-[10px] text-gray-500 absolute bottom-1 right-2">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {typingSender && ( // Display typing indicator if a sender is typing
          <div className="flex justify-start mb-3 animate-pulse">
            <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm text-gray-500 text-sm italic">
              <span className={`font-bold ${participantColors[typingSender]}`}>{typingSender}</span> is typing...
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Fake Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-gray-500 mr-2">
             {/* Plus Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
          </div>
          
          {/* Input Box */}
          <div className="flex-1 bg-white rounded-lg px-4 py-2 mx-2 flex items-center shadow-sm">
             <input disabled type="text" placeholder="Message" className="bg-transparent w-full focus:outline-none text-sm" />
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-pointer ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
             </svg>
          </div>

          {/* Mic/Camera Icons */}
          <div className="flex items-center space-x-3 text-gray-500 ml-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
          </div>
      </div>
    </div>
  );
}

export default ChatInterface;