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
            <div className="absolute top-0 w-full h-16 bg-[#075E54] flex items-center px-4 shadow-md z-10 text-white">
                 <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600 font-bold">
                    {/* Placeholder Avatar */}
                    {activeParticipants[1]?.[0] || "G"}
                 </div>
                 <div>
                    <h1 className="text-lg font-semibold">{chatName || "Chat Simulator"}</h1>
                    <p className="text-xs opacity-75">Online</p>
                 </div>
            </div>

            {/* Chat Area */}
            <div className="absolute top-16 bottom-0 w-full p-4 flex flex-col pt-4">
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
                        <div key={index} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`} style={{ transform: `scale(${scale})` }}>
                            <div className={`p-2 rounded-lg shadow-sm max-w-[80%] break-words relative pb-5 ${isMe ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                <span className={`font-bold text-xs block mb-1 ${isMe ? 'text-green-700' : 'text-gray-700'}`}>
                                    {msg.sender}
                                </span>
                                <p className="text-sm leading-relaxed pr-2 text-black">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {timedMessages.some(msg => frame >= msg.typingStart && frame < msg.typingEnd) && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-gray-500 text-sm italic animate-pulse">
                            typing...
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer (Fake Input) */}
             <div className="absolute bottom-0 w-full bg-[#f0f2f5] h-16 px-4 flex items-center justify-between z-10">
                 {/* Icons placeholder */}
                 <div className="w-full h-10 bg-white rounded-full mx-2" />
             </div>
        </AbsoluteFill>
    );
};
