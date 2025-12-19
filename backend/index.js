import express from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { enableTailwind } from '@remotion/tailwind';
import path from 'path';
import fs from 'fs';
import os from 'os';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { logRender } from './src/services/analytics.js';

const app = express();
const port = 8000;

app.set('trust proxy', true); // Enable IP capture behind proxies (DigitalOcean/Nginx)
app.use(cors());
app.use(express.json());

// --- State Management ---
let bundled = null; // Cache the webpack bundle
const jobQueue = []; // FIFO Queue of jobIDs
const jobs = new Map(); // Store job details: { id, status, progress, filePath, error, createdAt }
let isProcessing = false;

// Ensure temp directory exists
const TMP_DIR = path.join(os.tmpdir(), 'whatsapp_simulator_exports');
if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

// --- Helper Functions ---
const calculateDuration = (messages) => {
    const fps = 30;
    let frames = 0;
    messages.forEach(msg => {
        const typingDuration = Math.max(15, Math.ceil((msg.message.length * 50) / 1000 * fps));
        frames += (15 + typingDuration + 30);
    });
    return frames + 60;
};

// --- Initialization ---
const initBundle = async () => {
    console.log("Creating Webpack bundle... (This happens once)");
    try {
        bundled = await bundle(path.join(process.cwd(), './src/index.js'), () => undefined, {
            webpackOverride: (config) => enableTailwind(config),
        });
        console.log("Bundle created successfully!", bundled);
    } catch (err) {
        console.error("Failed to create bundle:", err);
        process.exit(1);
    }
};

// --- Queue Processor ---
const processQueue = async () => {
    if (isProcessing || jobQueue.length === 0) return;

    isProcessing = true;
    const jobId = jobQueue.shift(); // Get first job
    const job = jobs.get(jobId);

    if (!job) {
        isProcessing = false;
        processQueue(); // Skip if invalid
        return;
    }

    try {
        console.log(`Processing Job ${jobId}...`);
        job.status = 'processing';
        job.startedAt = Date.now();
        jobs.set(jobId, job);

        const { script, participants, chatName, resolution, quality, participantColors } = job.payload;

        // Composition Config
        const compositionId = 'ChatVideo';
        let crf = 18;
        if (quality === 'high') crf = 10;

        const durationInFrames = calculateDuration(script);

        // Select Composition
        const composition = await selectComposition({
            serveUrl: bundled,
            id: compositionId,
            inputProps: { script, participants, chatName, renderId: jobId, durationInFrames, participantColors },
        });

        const outputLocation = path.join(TMP_DIR, `${jobId}.mp4`);

        console.log(`Rendering ${jobId} to ${outputLocation}`);
        
        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'h264',
            outputLocation: outputLocation,
            inputProps: { script, participants, chatName, renderId: jobId, durationInFrames, participantColors },
            durationInFrames: durationInFrames,
            fps: 30,
            crf: crf,
        });

        job.status = 'completed';
        job.filePath = outputLocation;
        job.completedAt = Date.now();
        console.log(`Job ${jobId} Completed!`);

        // Log to Analytics
        logRender(job, job.ip);

    } catch (err) {
        console.error(`Job ${jobId} Failed:`, err);
        job.status = 'error';
        job.error = err.message;
    } finally {
        jobs.set(jobId, job);
        isProcessing = false;
        processQueue(); // Process next item
    }
};

// --- API Endpoints ---

// 1. Add to Queue
app.post('/api/queue', (req, res) => {
    const { script, participants, chatName, resolution, quality, participantColors } = req.body;

    if (!script || !participants) {
        return res.status(400).json({ error: "Missing script or participants" });
    }

    // Basic concurrency safety cap
    if (jobQueue.length > 50) {
        return res.status(503).json({ error: "Server is busy. Please try again later." });
    }

    const jobId = uuidv4();
    const position = jobQueue.length;

    const job = {
        id: jobId,
        status: 'queued',
        payload: { script, participants, chatName, resolution, quality, participantColors },
        ip: req.ip, // Capture IP for analytics
        createdAt: Date.now()
    };

    jobs.set(jobId, job);
    jobQueue.push(jobId);

    // Trigger processor (in case it's idle)
    processQueue();

    res.json({ success: true, jobId, position });
});

// 2. Check Status
app.get('/api/status/:id', (req, res) => {
    const jobId = req.params.id;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }

    // Calculate dynamic queue position if queued
    let position = null;
    if (job.status === 'queued') {
        position = jobQueue.indexOf(jobId);
    }

    res.json({
        id: job.id,
        status: job.status,
        position: position,
        error: job.error
    });
});

// 3. Download File
app.get('/api/download/:id', (req, res) => {
    const jobId = req.params.id;
    const job = jobs.get(jobId);

    if (!job || job.status !== 'completed' || !job.filePath) {
        return res.status(404).json({ error: "File not ready or not found" });
    }

    res.download(job.filePath, 'whatsapp-chat.mp4', (err) => {
        if (err) {
            console.error("Download Error:", err);
            return;
        }
        // File is kept for now. Cleanup policy needed for production.
    });
});


// Start Server
app.listen(port, async () => {
    await initBundle(); // Block server start until bundle is ready
    console.log(`Queue Server running at http://localhost:${port}`);
});
