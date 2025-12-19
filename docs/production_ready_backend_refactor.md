# Production Ready Backend Refactor Plan

**Date**: 2025-12-19
**Objective**: Prepare the `whatsapp_chat_simulator` backend for deployment on a shared DigitalOcean Droplet (low resource environment). The goal is to prevent server crashes due to concurrent video rendering, provide user feedback via a queue system, and implement basic usage tracking without requiring user authentication.

## 1. Core Architectural Changes

### A. Backend (`/backend`)

**1. Optimization: Bundle Caching**
*   **Current State**: `bundle()` runs on *every* request, consuming high CPU.
*   **New State**: Run `bundle()` **once** when the server starts. Reuse the bundled Webpack output for all subsequent render requests. This drastically reduces the CPU load for each job.

**2. Concurrency Control: The FIFO Queue**
*   **Problem**: Remotion/Puppeteer is RAM-heavy. Two concurrent renders will crash a 1GB/2GB server.
*   **Solution**: Implement an in-memory Job Queue.
    *   **Limit**: Process strictly **1** job at a time.
    *   **Behavior**:
        *   Incoming requests are added to a `queue`.
        *   Worker processes the first item.
        *   Others wait in "pending" state.
        *   If the queue gets too long (e.g., >20), reject new requests (optional safety).

**3. API Redesign (Polling Pattern)**
To support the queue, we move from a synchronous `POST /render` (which hangs until done) to an asynchronous flow:

*   `POST /api/queue`:
    *   **Input**: JSON body (script, participants, config).
    *   **Action**: Validates input, adds to in-memory queue, assigns a unique `jobId`.
    *   **Response**: `{ success: true, jobId: "uuid", position: 3 }`
*   `GET /api/status/:jobId`:
    *   **Response**: `{ state: "queued" | "processing" | "completed" | "error", position: 2, progress: 0.5 }` (Progress is optional/bonus).
*   `GET /api/download/:jobId`:
    *   **Action**: Streams the final MP4 file. Cleans up file after successful download (or after a TTL).

**4. Analytics Layer (Usage Tracking)**
*   **Goal**: Track "Unique Users" and "Total Videos Generated".
*   **Implementation**: Create an `AnalyticsService` abstraction.
    *   **Adapter A (Production)**: Connects to Supabase. Logs inserts to a `renders` table.
    *   **Adapter B (Local/Fallback)**: Appends to a local `data/analytics.json` file.
    *   **Logic**: The app detects if Supabase credentials exist in `.env`. If yes, use Supabase; if no, use Local.

### B. Frontend (`/frontend`)

**1. `VideoExporter.jsx` Refactor**
*   **Old Flow**: `fetch('/render')` -> await blob -> save.
*   **New Flow**:
    1.  `fetch('/api/queue')` -> get `jobId`.
    2.  **Enter Polling Loop**: Call `/api/status/:jobId` every 2 seconds.
    3.  **Update UI**:
        *   If `state === 'queued'`: Show "Queue Position: #X".
        *   If `state === 'processing'`: Show "Rendering Video...".
    4.  **Completion**: When `state === 'completed'`, trigger download from `/api/download/:jobId`.

## 2. Implementation Phases

### Phase 1: Backend Core Refactor
1.  Modify `backend/index.js` to initialize `bundled` on startup.
2.  Implement the `JobQueue` class (add, process, getStatus).
3.  Replace the single `/render` endpoint with the 3 new API endpoints.
4.  Ensure `renderMedia` output is stored with a retrievable ID (e.g., inside `os.tmpdir()/exports/`).

### Phase 2: Analytics Integration
1.  Create `backend/src/services/analytics.js`.
2.  Implement `logRender(metadata)` function.
3.  Setup Supabase client (using `supabase-js`).
4.  Setup JSON fallback logic.
5.  Integrate `logRender` into the "Job Completed" event in the Queue.

### Phase 3: Frontend Integration
1.  Update `VideoExporter.jsx` state machine (Idle -> Queued -> Processing -> Download).
2.  Add visual feedback for Queue Position.

## 3. Local Development Compatibility
*   **Environment Variables**: The project will look for `SUPABASE_URL` and `SUPABASE_KEY`.
*   **Default Behavior**: If these are missing, the system defaults to "Local Mode" (saving analytics to a local file). This ensures anyone forking the repo can run it immediately without setting up external services.

## 4. Supabase Schema (Reference)
For the Production Adapter:
```sql
create table renders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  duration_frames int,
  resolution text,
  quality text,
  user_ip text -- Hashed or Anonymized for "Unique User" tracking
);
```
