# Backend Architecture

This document details the architecture of the **WhatsApp Chat Simulator** backend. The backend is a specialized Node.js server designed to render high-quality MP4 videos using **Remotion**.

## Tech Stack
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Video Engine**: Remotion (Server-Side Rendering)
- **Bundler**: Webpack (via `@remotion/bundler`)
- **Styling**: Tailwind CSS (processed via PostCSS)

## Directory Structure
The backend code resides in the `/backend` directory.

```text
/backend
├── src/
│   ├── ChatVideo.jsx    # The core Remotion video component
│   ├── index.js         # Remotion Root (Composition registration)
│   └── style.css        # Tailwind directives
├── index.js             # Express server entry point
├── package.json         # Dependencies
├── postcss.config.js    # PostCSS config for Tailwind
└── tailwind.config.js   # Tailwind config (mirrors frontend)
```

## Core Workflows

### 1. The Rendering Pipeline (`index.js`)
The Express server listens on port `8000` and exposes a single endpoint: `POST /render`.

**Process Flow:**
1.  **Receive Request**: Accepts JSON body containing:
    - `script`: Array of message objects.
    - `participants`: List of names.
    - `resolution`: '720p' or '1080p'.
    - `quality`: 'standard' or 'high'.
2.  **Configuration**:
    - Determines `compositionId` (e.g., 'ChatVideo-1080p') based on resolution.
    - Sets `crf` (Constant Rate Factor) based on quality (18 vs 10).
3.  **Duration Calculation**:
    - Runs `calculateDuration(script)` to determine the exact frame count needed.
    - Logic: Sums up typing time + reading time for every message + buffers.
4.  **Bundling**: Calls `bundle()` to compile the React code in `src/` into a Webpack bundle.
    - *Crucial*: Uses `enableTailwind()` override to ensure CSS is processed correctly.
5.  **Composition Selection**: Calls `selectComposition` to get metadata.
    - *Crucial*: Passes `durationInFrames` in `inputProps` so the Composition registers with the correct length.
6.  **Rendering**: Calls `renderMedia()` to generate the MP4.
    - Uses H.264 codec.
    - Saves to `os.tmpdir()`.
7.  **Delivery**: Streams the file to the client and deletes the temporary file (`fs.unlinkSync`).

### 2. The Video Component (`src/ChatVideo.jsx`)
This is the React component that Remotion renders frame-by-frame. It is a "twin" of the frontend `ChatInterface` but optimized for video.

**Key Logic:**
- **Frame-Based Timing**: Instead of `setTimeout`, it uses `useCurrentFrame()` and pre-calculated start/end frames for every message to trigger animations.
- **Responsive Scaling**:
    - It does **not** use fixed pixels for layout.
    - It calculates a `baseFontSize` based on the render `width` (e.g., `width / 25`).
    - The root container applies `style={{ fontSize: baseFontSize }}`.
    - All UI elements (padding, text size) use Tailwind classes (which use `rem` units), allowing them to scale perfectly from 400px (preview) up to 1080px (export) without code changes or blurriness.
- **Auto-Scroll**:
    - Calculates the cumulative height of messages visible at the current frame.
    - If height exceeds the viewport, applies a `transform: translateY()` to scroll the content up smoothly.

### 3. Remotion Root (`src/index.js`)
Registers the available Compositions.
- **Why multiple compositions?**
    - Registers `ChatVideo-720p` (Width: 720) and `ChatVideo-1080p` (Width: 1080).
    - This forces Remotion to allocate the correct buffer size for the rendering engine, ensuring true High Definition output (vs upscaling).
- **Dynamic Metadata**: Uses `calculateMetadata` to accept `durationInFrames` from the server prop, ensuring the video cuts exactly when the chat ends.

## Scaling Strategy
To achieve "Retina" quality video:
1.  We render at a high resolution (e.g., 1080x1920).
2.  We scale the `root font-size` proportionally.
3.  Since HTML/CSS rendering in Chrome is vector-based (for text and border-radius), increasing the font size renders crisp, sharp text at the target resolution. This avoids the blurriness associated with raster image upscaling.
