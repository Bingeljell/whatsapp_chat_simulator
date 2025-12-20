import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring, AbsoluteFill, interpolate } from 'remotion';
import { loadFont } from "@remotion/google-fonts/NotoColorEmoji";
import './style.css'; 

const { fontFamily } = loadFont();

const calculateTimings = (messages, fps) => {
    let currentFrame = 0;
    const timings = messages.map((msg) => {
        const typingDuration = Math.max(15, Math.ceil((msg.message.length * 50) / 1000 * fps)); 
        const startFrame = currentFrame + 15; 
        const endFrame = startFrame + typingDuration;
        
        const item = {
            ...msg,
            startFrame: endFrame,
            typingStart: startFrame,
            typingEnd: endFrame
        };
        
        currentFrame = endFrame + 30; 
        return item;
    });
    return timings;
};

export const ChatVideo = ({ script, participants, chatName, participantColors }) => { 
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig(); 
    
    // Defensive coding for colors
    const colors = participantColors || {};

    // Default data
    const messages = script || [
        { sender: "Alice", message: "Hello!" },
        { sender: "Bob", message: "Hi Alice, how are you?" }
    ];
    
    const activeParticipants = participants || ["Alice", "Bob"];
    const timedMessages = useMemo(() => calculateTimings(messages, fps), [messages, fps]);

    // --- SCALING LOGIC (Transform Approach) ---
    // Tailwind uses rem, which doesn't scale with container fontSize.
    // So we must use CSS Transform to scale the entire UI from a base "Mobile" design (400px).
    const BASE_WIDTH = 400; 
    const scale = width / BASE_WIDTH;
    const scaledHeight = height / scale; // Adjust height to fit the viewport exactly when when scaled

    // --- AUTO-SCROLL LOGIC ---
    // Heights are in PIXELS relative to the BASE_WIDTH (400px) design.
    const estimateMessageHeight = (msg) => {
        const lineLength = 35; 
        const lines = Math.ceil(msg.message.length / lineLength);
        const baseHeight = 72; // ~4.5rem (approx 72px)
        const lineHeight = 24; // ~1.5rem (approx 24px)
        return baseHeight + (lines * lineHeight);
    };

    let currentScrollOffset = 0;
    let totalContentHeight = 16; // 1rem padding top

    timedMessages.forEach(msg => {
        if (frame >= msg.startFrame) {
            totalContentHeight += estimateMessageHeight(msg);
        }
    });

    // Find who is typing
    let currentTypingSender = null;
    const isTypingActive = timedMessages.some(msg => {
        if (frame >= msg.typingStart && frame < msg.typingEnd) {
            currentTypingSender = msg.sender;
            return true;
        }
        return false;
    });

    const formatTimeFromIndex = (index) => {
        const baseMinutes = 9 * 60; // 09:00
        const totalMinutes = baseMinutes + index;
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const getReceiptForFrame = (startFrame) => {
        const deliveredAt = startFrame + Math.round(fps * 0.6);
        const readAt = startFrame + Math.round(fps * 1.6);
        if (frame < startFrame) return null;
        if (frame < deliveredAt) return 'sent';
        if (frame < readAt) return 'delivered';
        return 'read';
    };

    // Visible Area: Total Height (scaledHeight) - Header (64px) - Footer (64px)
    const visibleArea = scaledHeight - 64 - 64;

    if (totalContentHeight > visibleArea) {
        const overScroll = totalContentHeight - visibleArea;
        currentScrollOffset = overScroll;
    }

    return (
        <AbsoluteFill className="bg-white">
            <div style={{
                width: BASE_WIDTH,
                height: scaledHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                overflow: 'hidden',
                position: 'relative',
                    fontFamily: `sans-serif, ${fontFamily}`
            }}>
                {/* Background / Wallpaper */}
                <div className="absolute inset-0 bg-[#ECE5DD] opacity-100" />

                {/* Header */}
                <div className="absolute top-0 w-full h-16 bg-[#075E54] flex items-center justify-between px-4 shadow-md z-20 text-white">
                     <div className="flex items-center flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                            {activeParticipants[1]?.[0] || "G"}
                        </div>
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-semibold truncate">{chatName || "Chat Simulator"}</h1>
                            <p className="text-xs opacity-75">Online</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-4 ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                        </svg>
                     </div>
                </div>

                {/* Chat Area */}
                <div className="absolute top-16 bottom-16 w-full overflow-hidden">
                    <div style={{ 
                        padding: '1rem', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transform: `translateY(-${currentScrollOffset}px)`,
                        // Remove transition for frame-perfect rendering (or keep linear)
                        // transition: 'transform 0.1s linear' 
                    }}>
                        {timedMessages.map((msg, index) => {
                            const progress = spring({
                                frame: frame - msg.startFrame,
                                fps,
                                config: { damping: 200 }
                            });
                            const scale = interpolate(progress, [0, 1], [0, 1]);
                            if (frame < msg.startFrame) return null;
                            const isMe = activeParticipants[0] === msg.sender;
                            const receipt = isMe ? getReceiptForFrame(msg.startFrame) : null;
                            const timeText = formatTimeFromIndex(index);

                            return (
                                <div key={index} className={`flex mb-3 items-start ${isMe ? 'justify-end' : 'justify-start'}`} style={{ transform: `scale(${scale})` }}>
                                    {!isMe && ( // Only show avatar for received messages
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-sm font-semibold text-gray-800 flex-shrink-0">
                                            {msg.sender.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className={`px-3 py-2 rounded-lg shadow-sm max-w-[80%] break-words relative pb-6 ${isMe ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                                        <span className={`font-bold text-sm block mb-1 ${colors[msg.sender] || 'text-gray-700'}`}>
                                            {msg.sender}
                                        </span>
                                        <p className="text-base leading-relaxed pr-2 text-black">{msg.message}</p>
                                        <span className="text-[10px] text-gray-500 absolute bottom-1 right-2 flex items-center gap-1">
                                            <span>{timeText}</span>
                                            {receipt && (
                                                receipt === 'sent' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none">
                                                        <path d="M4 12.5l4.5 4.5L20 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        className={`h-4 w-4 ${receipt === 'read' ? 'text-blue-500' : 'text-gray-400'}`}
                                                        fill="none"
                                                    >
                                                        <path d="M2.5 12.5l4.5 4.5L18.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M6.5 12.5l4.5 4.5L22.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isTypingActive && currentTypingSender && (
                            <div className="flex justify-start mb-3 animate-pulse">
                                <div className="bg-white px-3 py-2 rounded-lg rounded-tl-none shadow-sm text-gray-500 text-sm italic">
                                    <span className={`font-bold ${colors[currentTypingSender] || 'text-gray-700'}`}>{currentTypingSender}</span> is typing...
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                 <div className="absolute bottom-0 w-full bg-[#f0f2f5] h-16 px-4 flex items-center justify-between z-20 border-t border-gray-300">
                      <div className="flex items-center space-x-4 text-gray-500 mr-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                         </svg>
                      </div>
                      <div className="flex-1 bg-white rounded-lg px-4 py-2 mx-2 flex items-center shadow-sm h-10">
                         <span className="text-gray-400 text-sm">Message</span>
                         <div className="flex-1"></div>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                         </svg>
                      </div>
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
            </div>
        </AbsoluteFill>
    );
};
