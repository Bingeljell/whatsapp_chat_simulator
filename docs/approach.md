# Approach Note: Building a WhatsApp Chat Mocker Web App

This document outlines a high-level approach to developing a web app where users can upload or input chat scripts (e.g., dialogues in text or document format) and generate an animated mock-up of a WhatsApp conversation. The app will simulate messages scrolling and typing in a chat interface, with an optional export to video. Focus on a client-side-first design for simplicity and responsiveness, with backend options for advanced features.

## Key Features

- **User selects number of participants** and enters dialogues (typed or uploaded as .txt/.docx).
- **App parses the script** and animates the conversation in a WhatsApp-style interface.
- **Dialogues are processed in order** for linear flow.
- **Future/Optional**: Export the animated chat as a video (MP4 or GIF) using server-side rendering or React-video libraries.

## Recommended Languages and Tech Stack

- **Frontend**: JavaScript (ES6+) as the core language, paired with React.js for building interactive components. React's state management (e.g., hooks like `useState` and `useEffect`) is ideal for handling user inputs, parsing, and animations. Alternatives: Vue.js for a lighter framework or Vanilla JS for no-framework simplicity.
- **Styling and Animations**: CSS (with Tailwind CSS or Bootstrap for rapid prototyping) specifically targeting **WhatsApp Mobile UI** (not desktop). Use CSS keyframes/transitions or libraries like Anime.js for typing and scrolling effects.
    - **Note on Tailwind CSS Version**: We are currently using **Tailwind CSS v3.4.17** for its stability and compatibility with standard development workflows. Tailwind CSS v4 is a significant rewrite and, while potentially faster, is still very new and may require a different setup. We can consider upgrading to v4 in a later phase if its benefits become critical and its ecosystem matures.
- **Backend (Optional)**: Node.js with Express for handling file uploads/parsing (e.g., .docx via Mammoth) or video generation. This keeps the stack consistent with JavaScript.
- **Additional Libraries**:
    - *File handling*: Mammoth.js (client-side .docx parsing) or Multer (server-side uploads).
    - *Animations*: GSAP or Anime.js for sequenced message reveals.
    - *Video Export (Future)*: **Remotion** (React-to-video) or **Puppeteer** (server-side browser recording).
    - *Avoid*: Konva.js (too complex for replicating HTML/CSS UI).
- **Deployment**: Vercel or Netlify for hosting (free tiers support React apps with serverless backends).

## Project Structure

Organize the project for modularity, scalability, and ease of maintenance. We are using a **Monorepo** structure.

### Root Directory
- `package.json`: Orchestrates scripts for both frontend and backend.
- `frontend/`: The React + Vite application.
- `backend/`: The Node.js + Remotion video rendering server.

### Frontend (React App) - `/frontend`
- **Key Folders**:
    - `src/components`: Reusable UI pieces (`ParticipantSelector`, `ScriptInput`, `ChatInterface`).
    - `src/utils`: Helper functions (`parseScript`).
    - `src/App.jsx`: Main application logic.
    - `tailwind.config.js`: UI Styling configuration.

### Backend (Node.js + Remotion) - `/backend`
- **Purpose**: dedicated server to handle video rendering requests.
- **Key Files**:
    - `index.js`: Express server entry point.
    - `src/Video.jsx`: Remotion composition root.
    - `src/compositions/ChatVideo.jsx`: The video-optimized version of `ChatInterface`.
    - `Dockerfile`: For deployment to DigitalOcean VPS.

## Development Approach

1. **Start with MVP (Minimum Viable Product)**:
    - Build the frontend input form and basic chat rendering without animations.
    - Parse simple text inputs client-side (e.g., line-by-line format: `Sender: Message`).
    - Add static message display first, then layer in animations.

2. **Handle User Inputs**:
    - Use React forms for participant selection (dropdown or inputs).
    - For uploads: Browser `FileReader` for .txt; `Mammoth.js` for .docx.
    - Validate: Ensure senders match participants; handle errors with user feedback.

3. **Implement Animations**:
    - Create a scrollable container styled like **WhatsApp Mobile UI**.
    - Use state to add messages one-by-one with timed intervals.
    - Add "typing..." indicators before each message.

4. **Add Video Export (Remotion Backend)**:
    - **Architecture**: A Node.js Express server running on a VPS (DigitalOcean).
    - **Process**: Frontend sends the chat script (JSON) to the backend. Backend uses Remotion to render the video frame-by-frame and returns the MP4 file.
    - **Hosting**: Backend deployed via Docker. Frontend can remain static (or served by the same VPS).

### Enhancements and Best Practices:

- **Responsiveness**: Use media queries for mobile views.
- **Accessibility**: ARIA labels for chat elements.
- **Performance**: Batch animations for long scripts; use `requestAnimationFrame`.
- **Testing**: Unit tests with Jest (components/logic); end-to-end with Cypress.
- **Security**: Sanitize inputs to prevent XSS if rendering user text.

## Progress Status (as of Dec 9, 2025)

### Completed Tasks
1. **[x] Initialize React Project**: Scaffolded with Vite and configured Tailwind CSS v3.
2. **[x] Basic Mobile UI Structure**: Set up `App.jsx` with mobile-width container, header, and background.
3. **[x] Participant Selector**: Created component for managing participant count, names, and chat title.
4. **[x] Script Input & Parsing**: Implemented text input and client-side parsing logic.
5. **[x] Chat Animation**: Built `ChatInterface` with sequential messaging, typing indicators, and auto-scroll.
6. **[x] File Upload**: Integrated `mammoth.js` for `.docx` and `.txt` support.

### Pending / Future Tasks

#### UI/UX Refinements
9. **[x] Implement "Replay" button in the frontend UI.**
10. **[x] Implement User Colorization for messages in both frontend and backend.**
11. **[x] Update "Typing" Indicator to show "<user> is typing..." in both frontend and backend.**
12. **[x] Add Generic User/Group Icons in chat bubbles and headers for both frontend and backend.**

#### Core Feature Enhancements
13. **[x] Add "Read" receipts (blue ticks) animation.**
14. **[ ] Implement Emoji picker support.**
15. **[ ] Improve error handling with better visual feedback.**
16. **[ ] Add support for image/media messages in script.**
