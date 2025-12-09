import React, { useState, useEffect, useRef } from 'react';

function ChatInterface({ messages, participants }) {
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Reset displayed messages when new script is parsed
  useEffect(() => {
    setDisplayedMessages([]);
    setIsTyping(false);
  }, [messages]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    let messageIndex = 0;
    let timer;

    const displayNextMessage = () => {
      if (messageIndex < messages.length) {
        const currentMessage = messages[messageIndex];
        const delay = Math.max(500, currentMessage.message.length * 50); // Simulate typing speed

        setIsTyping(true);
        timer = setTimeout(() => {
          setIsTyping(false);
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
  }, [displayedMessages, isTyping]);

  return (
    <div className="flex flex-col flex-1 p-4 bg-whatsapp-bg overflow-y-auto rounded-lg shadow-inner">
      {displayedMessages.map((msg, index) => (
        <div
          key={index}
          className={`flex mb-2 ${
            // Assuming the first participant is 'You' for styling sent messages
            participants[0] === msg.sender ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`p-2 rounded-lg shadow max-w-[80%] break-words ${
                participants[0] === msg.sender
                ? 'bg-whatsapp-bubble text-black ml-auto' // Sent message style
                : 'bg-white text-black mr-auto' // Received message style
            }`}
          >
            <span className="font-bold text-sm block">{msg.sender}</span>
            <p className="text-sm">{msg.message}</p>
            {/* Timestamp placeholder - could be added if needed */}
            <span className="text-xs text-gray-500 float-right ml-4">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      {isTyping && (
        <div className="flex justify-start mb-2">
          <div className="bg-white p-2 rounded-lg shadow max-w-[80%] text-gray-500 italic">
            Typing...
          </div>
        </div>
      )}
      <div ref={chatBottomRef} /> {/* Scroll target */}
    </div>
  );
}

export default ChatInterface;
