# Real-Time AI Incident Room

A real-time incident management web application where teams can report, track, and resolve incidents with AI-powered assistance.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Mongoose (DB: `IncidentRoom`)
- **Real-time**: Socket.IO via custom Node.js server
- **AI**: Google Gemini 1.5 Flash (with rule-based fallback)

## Features

- Incident Dashboard with stats, search, status filter
- Create Incidents with validation
- Real-time updates via Socket.IO (no page refresh)
- AI Assist: Summary, Next Actions, Priority Review
- Status Workflow: Open → Investigating → Resolved

## Setup

```bash
npm install
```

Create `.env.local`:
```
MONGODB_URI=mongodb+srv://...IncidentRoom?retryWrites=true&w=majority
GEMINI_API_KEY=your_key
```

```bash
npm run dev    # dev
npm run build && npm start  # prod
```

## AI Fallback

If Gemini API fails, the app auto-falls back to rule-based summaries and action items.

## Architecture

- `server.js` — Custom Node.js + Socket.IO server
- `app/page.tsx` — Dashboard
- `app/incidents/[id]/page.tsx` — Incident detail + live updates + AI
- `app/api/incidents/` — REST API with real-time socket emission
- `models/` — Mongoose schemas
- `lib/` — MongoDB connection + Socket.IO client singleton
