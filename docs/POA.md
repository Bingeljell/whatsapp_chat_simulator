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

## Tech Stack

- **Frontend**: React.js with JavaScript (ES6+).
- **Styling**: Tailwind CSS for **WhatsApp Mobile UI** (specifically targeting mobile layout, not desktop).
- **Animations**: Anime.js or GSAP for message sequencing.
- **File Parsing**: Mammoth.js for .docx (client-side).
- **Video Generation (Future)**: Remotion (React-based) or Puppeteer (server-side) for high-fidelity export.
- **Backend (Optional)**: Node.js/Express for advanced file handling or video rendering.
- **Deployment**: Vercel or Netlify.

## Project Structure

```text
WA_Chat_Simulator/
├── public/
│   ├── index.html
│   └── assets/  # Icons, backgrounds
├── src/
│   ├── components/
│   │   ├── ParticipantSelector.jsx
│   │   ├── ScriptInput.jsx
│   │   ├── ChatInterface.jsx
│   │   └── VideoExporter.jsx
│   ├── utils/
│   │   ├── parseScript.js
│   │   └── animateChat.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   └── Preview.jsx
│   ├── App.jsx
│   ├── index.js
│   └── styles/  # Tailwind config
├── server/  # Optional backend
│   ├── routes/
│   │   ├── upload.js
│   │   └── generateVideo.js
│   └── server.js
├── package.json
└── README.md
```

## Installation

1. Clone the repository: `git clone <repo-url>`.
2. Navigate to the project: `cd WA_Chat_Simulator`.
3. Install dependencies: `npm install`.
4. For backend (if using): `cd server && npm install`.
5. Start the app: `npm start` (frontend). For backend: `node server.js`.

## Usage

1. Open the app in your browser.
2. Select participant count and enter names.
3. Input dialogues (e.g., "Alice: Hello!") or upload a file.
4. Submit to view the animated chat.
5. Click "Export Video" to download MP4/GIF.

## Development Notes

- **Parsing**: Scripts are line-based; sender separated by colon.
- **Animations**: Use `useEffect` with `setInterval` for timed message additions.
- **Video**: Avoid Konva.js/Canvas manual drawing. Use Remotion or Puppeteer for HTML-to-Video rendering.
- **Extensions**: Add emoji support, branching conversations, or audio.

## Contributing

Fork the repo, create a branch, and submit a pull request. Follow standard React best practices.

## License

MIT License. See LICENSE file for details.
