# Backend Architecture

This document details the architecture of the **WhatsApp Chat Simulator** backend. The backend is a specialized Node.js server designed to render high-quality MP4 videos using **Remotion**, optimized for production deployment on low-resource VPS environments (e.g., DigitalOcean Basic Droplet).

## Tech Stack
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Video Engine**: Remotion (Server-Side Rendering)
- **Bundler**: Webpack (via `@remotion/bundler`)
- **Queue System**: In-memory FIFO queue (custom implementation)
- **Analytics**: Service adapter (Supabase or Local JSON)
- **Styling**: Tailwind CSS (processed via PostCSS)

## Directory Structure
The backend code resides in the `/backend` directory.

```text
/backend
├── src/
│   ├── services/
│   │   └── analytics.js # Handles logging (Supabase/JSON)
│   ├── ChatVideo.jsx    # The core Remotion video component
│   ├── index.js         # Remotion Root (Composition registration)
│   └── style.css        # Tailwind directives
├── data/
│   └── analytics.json   # Local fallback for analytics logs
├── index.js             # Express server entry point (Queue & API)
├── package.json         # Dependencies
├── postcss.config.js    # PostCSS config for Tailwind
└── tailwind.config.js   # Tailwind config (mirrors frontend)
```

## Core Workflows

### 1. Startup Optimization
When the server starts (`npm start`), it immediately executes `bundle()`.
- **Purpose**: Pre-compiles the React/Remotion code into a Webpack bundle.
- **Benefit**: Removes the heavy CPU cost of bundling from the user request flow. Subsequent video render requests reuse this cached bundle, ensuring instant start times.

### 2. The Queue-Based Rendering Pipeline (`index.js`)
To prevent server crashes from concurrent heavy rendering tasks, the system uses a **Strict FIFO (First-In-First-Out) Queue**.

**API Flow:**

1.  **Enqueue (`POST /api/queue`)**:
    - Accepts `script`, `participants`, `config`.
    - Generates a unique `jobId` (UUID).
    - Adds the job to the in-memory `jobQueue`.
    - Returns `{ success: true, jobId, position }` immediately.
    
2.  **Poll Status (`GET /api/status/:jobId`)**:
    - Frontend polls this endpoint every ~2 seconds.
    - Returns status: `'queued'`, `'processing'`, `'completed'`, or `'error'`.
    - If queued, returns the current `position` in line (e.g., "You are #2").

3.  **Process Queue (Internal Loop)**:
    - The server watches the queue. If `isProcessing` is false and queue has items:
    - **Pop**: Takes the first job.
    - **Lock**: Sets `isProcessing = true`.
    - **Render**: Calls `renderMedia()` using the cached bundle and job payload.
    - **Save**: Writes output to `os.tmpdir()/whatsapp_simulator_exports/{jobId}.mp4`.
    - **Unlock**: Sets `isProcessing = false` and triggers the next job.
    - **Log**: Calls `AnalyticsService.logRender()`.

4.  **Download (`GET /api/download/:jobId`)**:
    - Streams the completed MP4 file to the user.

### 3. Analytics Service (`src/services/analytics.js`)
Tracks usage stats (Unique Users, Total Renders) without mandatory login.
- **Adapter Pattern**:
    - Checks for `SUPABASE_URL` and `SUPABASE_KEY` env vars.
    - **If Present**: Logs render metadata to Supabase `renders` table.
    - **If Missing**: Appends metadata to `backend/data/analytics.json`.
- **Privacy**: Hashes IP addresses using SHA-256 before storing to track "unique users" anonymously.

### 4. The Video Component (`src/ChatVideo.jsx`)
(Same as previous architecture)
- **Responsive Scaling**: Uses dynamic root `fontSize` based on render width (720px/1080px) to ensure "Retina" quality text at any resolution.
- **Auto-Scroll**: Calculates cumulative message height frame-by-frame to animate scrolling.

## Deployment Strategy (DigitalOcean)
- **Process Management**: Use `pm2` to keep the server alive and restart on crash.
- **Resource Safety**: The Queue ensures that RAM usage remains stable (approx 1 Chromium instance) regardless of how many users try to export videos simultaneously.