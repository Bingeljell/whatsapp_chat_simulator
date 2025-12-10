# Changelog

## [Unreleased] - 2025-12-09

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

- **UI/UX**:
    - **Mobile Layout**: constrained `App.jsx` to a centered, mobile-width container (`max-w-md`) with shadow to mimic a phone screen on desktop.
    - **Header**:
        - Added dynamic title (shows "Chat Simulator" or Chat Name/Participant list).
        - Added authentic WhatsApp-style icons (Video Call, Voice Call, Menu).
        - Added "Back" button logic to return from chat view to editor.
    - **Styling**: Defined custom WhatsApp-themed colors in `tailwind.config.js` (`whatsapp-green-dark`, `whatsapp-bg`, etc.).

### Changed
- **Architecture**:
    - **Monorepo**: Decided to restructure project into `frontend` (React) and `backend` (Node.js/Remotion) to support high-quality video generation on a VPS.
    - **Video Strategy**: Selected **Remotion (Server-Side)** over Puppeteer or Client-Side recording to ensure frame-perfect output on shared VPS hardware (DigitalOcean Docker).

- **Documentation**:
    - Updated `docs/POA.md` and `docs/approach.md` to reflect the move from Konva.js to Remotion/Puppeteer for future video export.
    - Updated `docs/approach.md` to specify "WhatsApp Mobile UI" as the target design.
    - Documented the decision to use Tailwind v3 over v4 for stability.

### Fixed
- **Animation Bug**: prevented chat animation from starting immediately upon typing in `ScriptInput`. Now requires explicit button click.
- **Sender Names**: Fixed issue where sender names were hidden for "You" or in 1-on-1 chats. Now always visible for clarity.

### Dependencies
- Added `mammoth` for document parsing.
- Added `tailwindcss`, `postcss`, `autoprefixer`.