# YTFlow — YouTube Download & Transcription

A fully functional Next.js 14 app to **download YouTube videos** and generate **AI-powered transcriptions**.

## Project Structure

```
ytflow/
├── app/                        ← Next.js App Router (root level!)
│   ├── layout.js               ← Root HTML layout
│   ├── page.jsx                ← Main homepage (React + GSAP)
│   └── api/
│       ├── download/route.js   ← GET/POST video download API
│       └── transcribe/route.js ← POST transcription API
├── index.html                  ← Standalone demo (no setup needed)
├── package.json
├── next.config.js
└── .env.example
```

> ⚠️ The `app/` directory is at the **project root**, not inside `src/`. This is required for Vercel deployment.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure (optional — app works without it)
cp .env.example .env.local
# Edit .env.local and add: OPENAI_API_KEY=sk-...

# 3. Run
npm run dev
# → http://localhost:3000
```

## What Works Without Any API Key

- ✅ Paste URL → fetches video title + thumbnail
- ✅ Download → streams video via ytdl-core OR redirects to cobalt.tools
- ✅ Transcribe → fetches YouTube auto-captions (works for most videos)
- ✅ Export SRT / TXT

## What Requires OPENAI_API_KEY

- 🧠 AI transcription of **any** video (even without auto-captions)
- 🧠 Whisper Large V3 accuracy (98.7%)
- 🧠 Transcription in 140+ languages

Get a key at: https://platform.openai.com/api-keys

## Deploy to Vercel

```bash
# Push to GitHub, then connect repo in Vercel dashboard
# Add OPENAI_API_KEY in Vercel → Settings → Environment Variables
npx vercel --prod
```

> **Note for long videos:** Vercel free tier has a 10s function timeout.
> Use Vercel Pro (60s) or self-host for videos over ~5 minutes.

## API Reference

### Get video info
```
POST /api/download
{ "url": "https://youtube.com/watch?v=..." }
```

### Stream download
```
GET /api/download?url=<url>&format=mp4&quality=1080p
```

### Transcribe
```
POST /api/transcribe
{ "url": "https://youtube.com/watch?v=...", "language": "auto" }
```
