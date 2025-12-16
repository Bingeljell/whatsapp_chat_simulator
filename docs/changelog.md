# Changelog

## [Unreleased] - 2025-12-10

### Added
- **Project Setup**:
    - Initialized React project using Vite (`npm create vite@latest`).
    - Installed and configured Tailwind CSS v3.4.17 (stable) for styling.
    - Created `src/components` directory structure.
    - Updated `README.md` with project overview and design notes.

- **Components**:
    - `ParticipantSelector.jsx`:
        - Implemented participant count selection (2-5).
        - Added dynamic input fields for participant names.
        - Added optional "Chat Name / Group Title" input field.
    - `ScriptInput.jsx`:
        - Created text area for manual script input.
        - Implemented parsing logic for `Sender: Message` format.
        - integrated `mammoth.js` for `.docx` file uploads.
        - Added support for `.txt` file uploads.
        - Added "Process Script" button to trigger parsing on demand (fixing premature animation bug).
    - `ChatInterface.jsx`:
        - Implemented sequential message animation with simulated typing delay.
        - Added auto-scrolling to the latest message.
        - Styled message bubbles to differentiate "You" (green, right) vs other participants (white, left).
        - Added "Fake" input footer (emoji, input pill, camera, mic) for visual authenticity.
        - **Design Choice**: Enabled sender name display for *all* messages (including "You") to ensure simulation clarity.
    - `VideoExporter.jsx`:
        - Component to trigger video rendering on the backend.
        - Added Resolution (720p/1080p) and Quality (Standard/High) selection dropdowns.

- **UI/UX Refinements**:
    - **Replay Button**: Added a "Replay Animation" button to the frontend UI to restart the chat simulation without reloading the page.
    - **User Colorization**: Implemented dynamic color assignment for participants. "You" is always green; other participants get distinct colors from a predefined palette in both frontend preview and exported video.
    - **Typing Indicator**: Updated the typing indicator to show "<User> is typing..." in the frontend preview and backend video export for better context.
    - **User Profile Pictures**: Added generic user profile pictures (initials on a gray background) to received messages in both frontend preview and exported video.

- **UI/UX**:
    - **Mobile Layout**: constrained `App.jsx` to a centered, mobile-width container (`max-w-md`) with shadow to mimic a phone screen on desktop.
    - **Header**:
        - Added dynamic title (shows "Chat Simulator" or Chat Name/Participant list).
        - Added authentic WhatsApp-style icons (Video Call, Voice Call, Menu).
        - Added "Back" button logic to return from chat view to editor.
    - **Styling**: Defined custom WhatsApp-themed colors in `tailwind.config.js` (`whatsapp-green-dark`, `whatsapp-bg`, etc.).
    - **Branding**:
        - Updated `frontend/index.html` with Title, Favicon, and SEO/Open Graph meta tags.
        - Integrated `wacm_logo.png` (from `assets/`) into the `App.jsx` desktop background.
        - Copied `wacm_logo.png` to `frontend/public/logo.png` and `frontend/public/favicon.png`.

### Changed
- **Architecture**:
    - **Monorepo**: Restructured project into `frontend` (React + Vite) and `backend` (Node.js/Remotion) directories.
    - **Video Strategy**: Selected **Remotion (Server-Side)** for high-quality, frame-perfect video generation on a VPS.
    - **Remotion Setup**: Configured `backend/` for Remotion rendering, including `ChatVideo.jsx` (Remotion composition) and an Express server.

- **Documentation**:
    - Updated `docs/POA.md`, `docs/approach.md` and `README.md` to reflect architectural changes, video strategy, and updated installation/usage instructions.
    - Updated `docs/approach.md` and `docs/changelog.md` with progress status and detailed change history.

### Fixed
- **Animation Bug**: Prevented chat animation from starting immediately upon typing in `ScriptInput`; now triggered by explicit button click.
- **Sender Names**: Ensured sender names are always visible for clarity above all messages.
- **Backend Remotion Rendering**:
    - Corrected `ChatVideo.jsx` import path in `backend/src/index.js` for ES Modules.
    - Resolved Webpack `CssSyntaxError` by installing missing loaders and using `@remotion/tailwind` for proper CSS/Tailwind processing.
    - Updated Remotion dependency versions for compatibility.
    - Enabled automatic cleanup of temporary `.mp4` files on the backend after download.
    - Synchronized `calculateDuration` logic in `backend/index.js` with `ChatVideo.jsx` timing.
    - **Video Resolution & Quality**: Implemented "Responsive Font Sizing" in `backend/src/ChatVideo.jsx` to scale UI elements (text, padding, icons) based on the target render width (1080p). This replaced manual scaling hacks and fixed clipping issues.
    - **Video Duration**: Fixed bug where video length was capped at 1 minute by moving duration calculation *before* composition selection in `backend/index.js`, ensuring `calculateMetadata` receives the correct duration prop.
    - **Auto-Scroll**: Implemented auto-scroll logic in the backend video component to prevent messages from disappearing off-screen during long chats.
- **Frontend Logic**:
    - Fixed `ReferenceError: useState is not defined` in `frontend/src/components/ChatInterface.jsx` by adding the missing React hooks import.
    - Fixed `Uncaught SyntaxError` regarding default export in `frontend/src/components/ChatInterface.jsx`.
    - Fixed `ReferenceError: resolution is not defined` in `frontend/src/App.jsx` by removing undefined props passed to `VideoExporter`.

### Known Bugs
- **Video Duration Mismatch**: The exported video length is currently fixed to the default Composition duration (1 minute) even when the actual animation finishes earlier. The `durationInFrames` override in `renderMedia` is not taking full effect.

### Limitations
- **Video Typing Indicator**: The exported video currently shows a generic "typing..." indicator, whereas the frontend preview shows "<User> is typing...". This parity update is pending for the backend.

### Dependencies
