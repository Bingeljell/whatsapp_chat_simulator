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

Organize the project for modularity, scalability, and ease of maintenance. Use a monorepo if combining frontend and backend.

### Frontend (React App)

- **Root Directory**: `/whatsapp-chat-mocker`
- **Key Folders**:
    - `/src/components`: Reusable UI pieces.
        - `ParticipantSelector.jsx`: Form for selecting participant count and names.
        - `ScriptInput.jsx`: Textarea for typing dialogues or file upload input.
        - `ChatInterface.jsx`: The animated chat view (DOM or canvas-based).
        - `VideoExporter.jsx`: Button and logic for recording/exporting.
    - `/src/utils`: Helper functions.
        - `parseScript.js`: Function to process input text into an array of `{sender, message}` objects (e.g., split lines by colon).
        - `animateChat.js`: Logic for sequencing messages with delays (using setTimeout or animation libraries).
    - `/src/assets`: Static files like WhatsApp icons, backgrounds.
    - `/src/pages`: If using React Router.
        - `Home.jsx`: Main page with input form.
        - `Preview.jsx`: Animation playback and export.
- **Entry Point**: `/src/App.jsx` – Routes and global state (e.g., via Context API for sharing dialogues).
- **Configuration**: `package.json` with dependencies (e.g., `react`, `animejs`).

### Backend (If Needed, Node.js/Express)

- **Root Directory**: `/server` (separate or integrated).
- **Key Folders**:
    - `/routes`: API endpoints.
        - `upload.js`: POST for file parsing (return JSON dialogues).
        - `generateVideo.js`: POST for script, uses Puppeteer to render and record.
    - `/utils`: Server-side parsers (e.g., Mammoth for .docx).
- **Entry Point**: `server.js` – Set up Express app, CORS for frontend integration.
- **Configuration**: `package.json` with dependencies (e.g., `express`, `puppeteer`, `multer`).

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

4. **Add Video Export (Future Phase)**:
    - **Approach A (Remotion)**: Use Remotion to render the React components to video frames.
    - **Approach B (Server-side)**: Send script to Node.js backend, which spins up a Puppeteer instance to record the screen.
    - Provide format options (MP4) and download links.

### Enhancements and Best Practices:

- **Responsiveness**: Use media queries for mobile views.
- **Accessibility**: ARIA labels for chat elements.
- **Performance**: Batch animations for long scripts; use `requestAnimationFrame`.
- **Testing**: Unit tests with Jest (components/logic); end-to-end with Cypress.
- **Security**: Sanitize inputs to prevent XSS if rendering user text.

This structure emphasizes a clean separation of concerns, making it easy to iterate. Begin by setting up the React project and prototyping the input-to-preview flow.
