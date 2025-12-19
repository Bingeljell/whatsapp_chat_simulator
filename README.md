# WhatsApp Chat Simulator

## Overview

- This project is a web application that allows users to create simulated WhatsApp conversations by inputting or uploading chat scripts. The app parses the dialogues, animates them in a WhatsApp-style chat interface, and optionally exports the simulation as a video.
- It's designed to be lightweight, client-side focused, and easy to extend.

## Features

- **Participant Selection**: Users choose the number of chat participants and assign names.
- **Script Input**: Enter dialogues via textarea or upload files (.txt or .docx).
- **Animation**: Simulates real-time messaging with typing indicators and scrolling.
- **Video Export**: Generate MP4 videos of the animated chat using a queue-based rendering server.
- **Responsive Design**: Works on desktop and mobile browsers.
- **Validation**: Checks for input errors like mismatched senders.

## Design Note

**Sender Names**: In this simulator, sender names are displayed above **every** message bubble (including the user's own messages). This is an intentional deviation from the native WhatsApp 1-on-1 chat UI to ensure maximum clarity for viewers watching the simulated conversation.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, Remotion (for server-side video rendering).
- **Database (Optional)**: Supabase (for analytics).

## Installation

1. Clone the repository: `git clone <repo-url>`.
2. Navigate to the project: `cd whatsapp_chat_simulator`.
3. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

## Configuration (Environment Variables)

The backend supports optional environment variables for Analytics. Create a `.env` file in `/backend` (or set them in your VPS environment):

```env
# Optional: Supabase Analytics
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

*If these are missing, analytics will be saved locally to `backend/data/analytics.json`.*

## Usage

**1. Start the Backend (Video Renderer):**
Open a terminal and run:
```bash
cd backend
npm start
```
*Server runs at http://localhost:8000. It will pre-bundle the video assets on startup.*

**2. Start the Frontend (UI):**
Open a **new** terminal window and run:
```bash
cd frontend
npm run dev
```
*App opens at http://localhost:5173*

## Deployment (DigitalOcean / VPS)

This app is production-ready for low-resource environments (1GB RAM):
1.  **Queue System**: The backend processes only **one video at a time** to prevent crashes.
2.  **Polling**: The frontend polls for status, showing users their queue position.
3.  **Bundle Caching**: Webpack runs only once at startup, saving CPU.

## License

MIT License.
