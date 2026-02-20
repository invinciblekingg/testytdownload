# YTFlow — YouTube Download & Transcription Platform

A fully functional, beautifully designed web app to **download YouTube videos** and generate **AI-powered transcriptions**.

Built with **Next.js 14**, **React 18**, and **GSAP 3.12** animations.

---

## 🚀 Quick Start (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Required for AI transcription (Whisper)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Without OpenAI key, the app falls back to YouTube auto-captions (still works!)
```

### 3. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## ✅ What Works Out of the Box

| Feature | Without API Key | With OpenAI Key |
|---------|----------------|-----------------|
| Download video info | ✅ via noembed | ✅ via ytdl-core |
| Download video/audio | ✅ opens cobalt.tools | ✅ direct stream |
| Transcription | ✅ YouTube auto-captions | ✅ OpenAI Whisper |
| Export SRT/TXT | ✅ Always | ✅ Always |
| Login/Signup | ✅ UI demo | ✅ Connect to auth |

---

## 🔧 Architecture

```
ytflow/
├── index.html                    ← Standalone demo (open in browser, no setup)
├── src/
│   └── app/
│       ├── page.jsx              ← Main React page
│       ├── layout.js             ← Root layout
│       └── api/
│           ├── download/
│           │   └── route.js      ← GET ?url=&format=&quality=
│           └── transcribe/
│               └── route.js      ← POST { url, language }
├── package.json
├── next.config.js
└── .env.example
```

---

## 📡 API Reference

### Download Video
```
GET /api/download?url=<youtube_url>&format=mp4&quality=1080p

Formats: mp4, mp3, webm
Quality: 4K, 1080p, 720p, 480p, 360p
```

### Get Video Info
```
POST /api/download
Content-Type: application/json
{ "url": "https://youtube.com/watch?v=..." }
```

### Transcribe
```
POST /api/transcribe
Content-Type: application/json
{ "url": "https://youtube.com/watch?v=...", "language": "en" }

language: "auto" (default) or ISO 639-1 code (en, es, fr, ja, zh...)
```

---

## 🔑 Getting an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account → API Keys → Create new secret key
3. Add to `.env.local` as `OPENAI_API_KEY=sk-...`
4. Whisper transcription costs ~$0.006/minute (very cheap)

---

## 🌐 Production Deployment

### Vercel (recommended)
```bash
npx vercel
# Add OPENAI_API_KEY in Vercel Environment Variables
```

### Self-hosted
```bash
npm run build
npm start
```

### Important: Vercel timeout
For long videos, Whisper transcription may timeout on Vercel's 10s function limit.
Use **Vercel Pro** (60s) or self-host for videos over 5 minutes.

Alternative: Use a queue-based approach with Redis + BullMQ for production.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + inline CSS |
| Animations | GSAP 3.12 + ScrollTrigger |
| Video DL | @distube/ytdl-core |
| Transcription | OpenAI Whisper API |
| Fonts | Bebas Neue + DM Sans + JetBrains Mono |

---

## 📄 License
MIT © YTFlow 2025
