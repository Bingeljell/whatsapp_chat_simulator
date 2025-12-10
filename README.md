# WhatsApp Chat Simulator

## Overview

- This project is a web application that allows users to create simulated WhatsApp conversations by inputting or uploading chat scripts. The app parses the dialogues, animates them in a WhatsApp-style chat interface, and optionally exports the simulation as a video.
- It's designed to be lightweight, client-side focused, and easy to extend.

## Features

- **Participant Selection**: Users choose the number of chat participants and assign names.
- **Script Input**: Enter dialogues via textarea or upload files (.txt or .docx).
- **Animation**: Simulates real-time messaging with typing indicators and scrolling.
- **Video Export (Future/Optional)**: Generate MP4 or GIF of the animated chat using server-side rendering or React-based video tools.
- **Responsive Design**: Works on desktop and mobile browsers.
- **Validation**: Checks for input errors like mismatched senders.

## Design Note

**Sender Names**: In this simulator, sender names are displayed above **every** message bubble (including the user's own messages). This is an intentional deviation from the native WhatsApp 1-on-1 chat UI to ensure maximum clarity for viewers watching the simulated conversation.

## Tech Stack

- **Frontend**: React.js with JavaScript (ES6+).
- **Styling**: Tailwind CSS for **WhatsApp Mobile UI** (specifically targeting mobile layout, not desktop).
- **Animations**: Anime.js or GSAP for message sequencing.
- **File Parsing**: Mammoth.js for .docx (client-side).
- **Video Generation (Future)**: Remotion (React-based) or Puppeteer (server-side) for high-fidelity export.
- **Backend (Optional)**: Node.js/Express for advanced file handling or video rendering.
- **Deployment**: Vercel or Netlify.

## Contributing

Fork the repo, create a branch, and submit a pull request. Follow standard React best practices.

## License

MIT License. See LICENSE file for details.

## Installation

1. Clone the repository: `git clone <repo-url>`.
2. Navigate to the project: `cd WA_Chat_Simulator`.
3. Install all dependencies:
   ```bash
   npm run install:all
   # OR manually:
   # npm install
   # cd frontend && npm install
   # cd backend && npm install
   ```

## Usage

This project is a monorepo containing a React frontend and a Node.js/Remotion backend.

**1. Start the Backend (Video Renderer):**
Open a terminal and run:
```bash
cd backend
npm start
```
*Server will run at http://localhost:8000*

**2. Start the Frontend (UI):**
Open a **new** terminal window and run:
```bash
cd frontend
npm run dev
```
*App will open at http://localhost:5173*

**3. Generate Video:**
- Create your chat script in the UI.
- Click "Process Script" to preview.
- Click the **"Export Video (MP4)"** button overlaying the chat.
- The backend will render the video (this may take a few seconds) and download it automatically.