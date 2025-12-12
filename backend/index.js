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
        frames += (15 + typingDuration + 30); // 15 (pre-typing) + Typing + 30 (reading/pause)
    });
    return frames + 60; // +2 seconds buffer at end
};

app.post('/render', async (req, res) => {
    try {
        const { script, participants, chatName, resolution, quality } = req.body;

        if (!script || !participants) {
            return res.status(400).json({ error: "Missing script or participants" });
        }

        console.log("Starting render for:", chatName, " Resolution:", resolution, " Quality:", quality);

        // Always use the single registered composition (which defaults to 1080p)
        const compositionId = 'ChatVideo';

        // Determine CRF (Constant Rate Factor) based on quality
        let crf = 18; // Default (Standard)
        if (quality === 'high') {
            crf = 10; // Very High quality (Near lossless, larger file size)
        }

        // 1. Bundle the Remotion project
        const bundled = await bundle(path.join(process.cwd(), './src/index.js'), () => undefined, {
            webpackOverride: (config) => enableTailwind(config),
        });

        // 2. Select composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: compositionId, // Use the dynamic ID
            inputProps: { script, participants, chatName, renderId: Date.now() }, // Add random ID to bust cache
        });

        // 3. Render
        const durationInFrames = calculateDuration(script); // Calculate duration early

        const tmpFile = path.join(os.tmpdir(), `chat-${Date.now()}-${resolution}-${quality}.mp4`);

        console.log(`Rendering to ${tmpFile}...`);
        console.log(`Stats: Duration=${durationInFrames} frames (${(durationInFrames/30).toFixed(1)}s), CRF=${crf}, Size=${composition.width}x${composition.height}`);

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: tmpFile,
            inputProps: { script, participants, chatName, renderId: Date.now(), durationInFrames }, // Pass duration here
            durationInFrames: durationInFrames, // Still pass as override for safety
            fps: 30,
            // Quality setting
            crf: crf,
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
