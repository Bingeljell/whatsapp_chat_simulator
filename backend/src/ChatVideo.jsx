import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, AbsoluteFill, interpolate } from 'remotion';
import './style.css'; // We will create this

const calculateTimings = (messages, fps) => {
    let currentFrame = 0;
    const timings = messages.map((msg) => {
        const typingDuration = Math.max(15, Math.ceil((msg.message.length * 50) / 1000 * fps)); // 50ms per char equivalent
        const startFrame = currentFrame + 15; // Small pause before typing
        const endFrame = startFrame + typingDuration;
        
        const item = {
            ...msg,
            startFrame: endFrame, // Message appears AFTER typing
            typingStart: startFrame,
            typingEnd: endFrame
        };
        
        currentFrame = endFrame + 30; // Pause after message sent
        return item;
    });
    return timings;
};

export const ChatVideo = ({ script, participants, chatName }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Default data if script is empty (for preview)
    const messages = script || [
        { sender: "Alice", message: "Hello!" },
        { sender: "Bob", message: "Hi Alice, how are you?" }
    ];
    
    const activeParticipants = participants || ["Alice", "Bob"];

    const timedMessages = useMemo(() => calculateTimings(messages, fps), [messages, fps]);

    // Auto-scroll logic (simple translation up)
    // We calculate total height and move up as new messages appear
    // For MVP, we will just stack them from top (WhatsApp style) and not perfect scroll yet
    
    return (
        <AbsoluteFill className="bg-white">
            {/* Background / Wallpaper */}
            <div className="absolute inset-0 bg-[#ECE5DD] opacity-100" />

            {/* Header */}
            <div className="absolute top-0 w-full h-16 bg-[#075E54] flex items-center justify-between px-4 shadow-md z-10 text-white">
                 <div className="flex items-center flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                        {/* Placeholder Avatar */}
                        {activeParticipants[1]?.[0] || "G"}
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-lg font-semibold truncate">{chatName || "Chat Simulator"}</h1>
                        <p className="text-xs opacity-75">Online</p>
                    </div>
                 </div>
                 
                 {/* Header Icons */}
                 <div className="flex items-center space-x-5 ml-2">
                    {/* Video Call */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {/* Voice Call */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {/* Menu */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                    </svg>
                 </div>
            </div>

            {/* Chat Area */}
            <div className="absolute top-16 bottom-16 w-full p-4 flex flex-col pt-4 overflow-hidden">
                {timedMessages.map((msg, index) => {
                    // Animation: Pop in
                    const progress = spring({
                        frame: frame - msg.startFrame,
                        fps,
                        config: { damping: 200 }
                    });
                    
                    const scale = interpolate(progress, [0, 1], [0, 1]);
                    
                    // Only render if it's time
                    if (frame < msg.startFrame) return null;

                    const isMe = activeParticipants[0] === msg.sender;

                    return (
                        <div key={index} className={`flex mb-3 ${isMe ? 'justify-end' : 'justify-start'}`} style={{ transform: `scale(${scale})` }}>
                            <div className={`px-3 py-2 rounded-lg shadow-sm max-w-[80%] break-words relative pb-5 ${isMe ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                <span className={`font-bold text-sm block mb-1 ${isMe ? 'text-green-700' : 'text-gray-700'}`}>
                                    {msg.sender}
                                </span>
                                <p className="text-base leading-relaxed pr-2 text-black">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {timedMessages.some(msg => frame >= msg.typingStart && frame < msg.typingEnd) && (
                    <div className="flex justify-start mb-3 animate-pulse">
                        <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm text-gray-500 text-sm italic">
                            typing...
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer (Fake Input) */}
             <div className="absolute bottom-0 w-full bg-[#f0f2f5] h-16 px-4 flex items-center justify-between z-10 border-t border-gray-300">
                  <div className="flex items-center space-x-4 text-gray-500 mr-2">
                     {/* Plus Icon */}
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                     </svg>
                  </div>
                  
                  {/* Input Box */}
                  <div className="flex-1 bg-white rounded-lg px-4 py-2 mx-2 flex items-center shadow-sm h-10">
                     <span className="text-gray-400 text-sm">Message</span>
                     <div className="flex-1"></div>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                     </svg>
                  </div>

                  {/* Mic/Camera Icons */}
                  <div className="flex items-center space-x-4 text-gray-500 ml-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                  </div>
             </div>
        </AbsoluteFill>
    );
};
