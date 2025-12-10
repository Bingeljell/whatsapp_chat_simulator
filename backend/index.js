import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind'; // Import enableTailwind
import path from 'path';
import fs from 'fs';
import os from 'os';
import cors from 'cors';

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Helper to calculate duration
const calculateDuration = (messages) => {
    // 30 fps. Estimate 3 seconds per message + 1 second buffer
    const fps = 30;
    let frames = 0;
    messages.forEach(msg => {
        const typingDuration = Math.max(15, Math.ceil((msg.message.length * 50) / 1000 * fps));
        frames += (typingDuration + 30); // Typing + reading time
    });
    return frames + 60; // +2 seconds buffer at end
};

app.post('/render', async (req, res) => {
    try {
        const { script, participants, chatName } = req.body;

        if (!script || !participants) {
            return res.status(400).json({ error: "Missing script or participants" });
        }

        console.log("Starting render for:", chatName);

        // 1. Bundle the Remotion project
        const bundled = await bundle(path.join(process.cwd(), './src/index.js'), () => undefined, {
            webpackOverride: (config) => enableTailwind(config),
        });

        // 2. Select composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: 'ChatVideo',
            inputProps: { script, participants, chatName },
        });

        // 3. Render
        const durationInFrames = calculateDuration(script);
        const tmpFile = path.join(os.tmpdir(), `chat-${Date.now()}.mp4`);

        console.log(`Rendering to ${tmpFile}... Frames: ${durationInFrames}`);

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: tmpFile,
            inputProps: { script, participants, chatName },
            durationInFrames: durationInFrames,
            fps: 30,
        });

        console.log("Render complete!");

        // 4. Send file
        res.download(tmpFile, 'chat-video.mp4', (err) => {
            if (err) console.error("Error sending file:", err);
            // Cleanup: fs.unlinkSync(tmpFile); // Optional: delete after send
            fs.unlinkSync(tmpFile); // Cleanup: delete after send

        });

    } catch (err) {
        console.error("Render error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Video render server running at http://localhost:${port}`);
});
