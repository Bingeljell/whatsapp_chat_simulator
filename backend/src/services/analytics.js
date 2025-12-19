import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// --- Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_FILE = path.join(DATA_DIR, 'analytics.json');

// Initialize Supabase if keys exist
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Analytics: Supabase enabled.");
} else {
    console.log("Analytics: Supabase keys missing. Using local JSON fallback.");
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// --- Helper: Anonymize IP ---
const hashIp = (ip) => {
    if (!ip) return 'unknown';
    return crypto.createHash('sha256').update(ip).digest('hex');
};

// --- Main Function ---
export const logRender = async (job, ipAddress) => {
    const record = {
        id: job.id,
        created_at: new Date().toISOString(),
        duration_frames: job.payload.script ? job.payload.script.length : 0, // Approx metric
        resolution: job.payload.resolution,
        quality: job.payload.quality,
        user_hash: hashIp(ipAddress),
        status: job.status
    };

    try {
        if (supabase) {
            await logToSupabase(record);
        } else {
            await logToLocal(record);
        }
    } catch (err) {
        console.error("Analytics Error:", err);
    }
};

const logToSupabase = async (record) => {
    const { error } = await supabase
        .from('renders')
        .insert([record]);
    
    if (error) throw error;
    console.log(`Analytics (Supabase): Logged job ${record.id}`);
};

const logToLocal = async (record) => {
    let data = [];
    if (fs.existsSync(LOCAL_FILE)) {
        try {
            const content = fs.readFileSync(LOCAL_FILE, 'utf-8');
            data = JSON.parse(content);
        } catch (e) {
            console.warn("Analytics: Corrupt local file, starting fresh.");
        }
    }
    
    data.push(record);
    fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
    console.log(`Analytics (Local): Logged job ${record.id}`);
};
