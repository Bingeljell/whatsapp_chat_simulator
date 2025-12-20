# Frontend Architecture

This document provides a detailed overview of the frontend architecture for the **WhatsApp Chat Simulator**. The frontend is a React application built with Vite and styled using Tailwind CSS.

## Tech Stack
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3.4.17
- **Language**: JavaScript (ES6+)

## Directory Structure
The frontend code resides in the `/frontend` directory.

```text
/frontend
├── public/              # Static assets (favicon, logo)
├── src/
│   ├── components/      # Reusable UI components
│   ├── assets/          # Project assets
│   ├── App.jsx          # Main application layout and state
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles (Tailwind directives)
├── index.html           # HTML template
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## Key Components

### 1. `App.jsx`
The root component that manages the global state and layout.
- **State Management**:
    - `participants`: Array of participant names (default: ['You', 'Participant 2']).
    - `messages`: Array of parsed message objects (`{ sender, message }`).
    - `showChat`: Boolean flag to toggle between the Input view and the Chat Preview.
    - `chatName`: String for the custom group/chat title.
- **Layout**:
    - Renders a "Desktop" container (`min-h-screen bg-gray-200`) with the app logo.
    - Renders a "Mobile Device" frame (`max-w-md`) containing the actual app UI.
    - Conditionally renders `VideoExporter` as a floating button in Desktop mode.

### 2. `components/ParticipantSelector.jsx`
Handles the setup of the chat participants.
- **Features**:
    - Dropdown to select number of participants (2-5).
    - Text inputs for renaming participants.
    - Input for setting the "Chat Name" (Group Title).
- **Props**:
    - `onParticipantsChange`: Callback to update parent state.
    - `onChatNameChange`: Callback to update parent state.

### 3. `components/ScriptInput.jsx`
The core input interface for the chat script.
- **Features**:
    - Textarea for manual script entry (Format: `Sender: Message`).
    - **File Upload**: Supports `.txt` and `.docx` (via `mammoth.js`) parsing.
    - **Validation**: Checks if sender names match the participants list.
    - **"Process Script"**: Button to trigger parsing and update the main app state (prevents premature animation).
- **Props**:
    - `participants`: List of valid senders.
    - `onScriptParsed`: Callback to return the array of parsed messages.

### 4. `components/ChatInterface.jsx`
The visual simulation of the WhatsApp chat.
- **Features**:
    - **Animation**: Uses `useEffect` and `setTimeout` to add messages one-by-one, simulating typing delays based on message length.
    - **Auto-Scroll**: Automatically scrolls to the bottom as new messages appear.
    - **Styling**: Distinct styles for "You" (Green bubble, right) vs others (White bubble, left).
    - **UI Elements**: Includes a fake "Input Area" (footer) and specific WhatsApp-style header icons.
- **Props**:
    - `messages`: The full script to animate.
    - `participants`: Used to determine which messages are "sent" vs "received".

### 5. `components/VideoExporter.jsx` (Refactored for Queueing)
Controls the video generation process via the Backend Queue API.
- **State Machine**:
    - `idle`: Initial state.
    - `initializing`: Sending request to queue.
    - `queued`: Waiting in line (Displays "Queue Position: #X").
    - `processing`: Backend is rendering (Displays "Rendering Video...").
    - `completed`: File ready (Triggers auto-download).
    - `error`: Something went wrong.
- **Logic**:
    - Uses a polling mechanism (`setInterval` / recursive `setTimeout`) to check `/api/status/:jobId` every 2 seconds.
    - Provides real-time feedback to the user about their position in the queue.

## Styling Strategy
- **Tailwind CSS**: Used for all styling.
- **Custom Config**: `tailwind.config.js` extends the theme with specific WhatsApp colors:
    - `whatsapp-green-dark`: `#075E54`
    - `whatsapp-green-light`: `#25D366`
    - `whatsapp-bg`: `#ECE5DD`
    - `whatsapp-bubble`: `#DCF8C6`
- **Responsive Design**: The app is designed to fill the `max-w-md` container, simulating a responsive mobile view.

## Data Flow
1.  **Input**: User defines participants and inputs script in `ScriptInput`.
2.  **Parsing**: `ScriptInput` parses text -> Array of Objects.
3.  **State Update**: `App.jsx` receives parsed data and switches `showChat` to `true`.
4.  **Preview**: `ChatInterface` receives data and runs the animation loop using React state.
5.  **Export Request**: `VideoExporter` POSTs data to `/api/queue` and receives a `jobId`.
6.  **Polling**: Frontend polls `/api/status/:jobId` until status is `completed`.
7.  **Download**: Frontend fetches `/api/download/:jobId`.