// src/app/api/transcribe/route.js
// Next.js 14 App Router — AI Transcription Endpoint
// Setup: npm install @distube/ytdl-core openai

import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

/**
 * POST /api/transcribe
 * Body: { url: string, language?: string }
 * Returns full transcript with timestamps
 */
export async function POST(request) {
  const tmpFile = join(tmpdir(), `ytflow_audio_${Date.now()}.mp4`);

  try {
    const { url, language = "auto" } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{8,}/;
    if (!ytRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback: YouTube auto-captions only (no OpenAI needed)
      return await fetchYouTubeCaptions(url);
    }

    // ─── STEP 1: Extract audio with ytdl-core ───
    const ytdl = require("@distube/ytdl-core");
    const OpenAI = require("openai");

    console.log("Fetching video info...");
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = parseInt(info.videoDetails.lengthSeconds);

    // Limit to 25MB for Whisper API (approx 25min of audio at 128kbps)
    if (duration > 1800) {
      return NextResponse.json(
        { error: "Video too long. Maximum 30 minutes for free transcription." },
        { status: 400 }
      );
    }

    // Get best audio format
    const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
    const bestAudio = audioFormats.sort((a, b) =>
      parseInt(b.audioBitrate || 0) - parseInt(a.audioBitrate || 0)
    )[0];

    // ─── STEP 2: Download audio to temp file ───
    console.log("Downloading audio...");
    const stream = ytdl(url, { format: bestAudio });
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const audioBuffer = Buffer.concat(chunks);
    await writeFile(tmpFile, audioBuffer);

    // ─── STEP 3: Transcribe with OpenAI Whisper ───
    console.log("Transcribing with Whisper...");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { createReadStream } = require("fs");

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tmpFile),
      model: "whisper-1",
      language: language === "auto" ? undefined : language,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    // ─── STEP 4: Format & return ───
    const segments = (transcription.segments || []).map(s => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    }));

    // Clean up temp file
    await unlink(tmpFile).catch(() => {});

    return NextResponse.json({
      success: true,
      title,
      transcript: transcription.text,
      segments,
      language: transcription.language || language,
      duration: transcription.duration || duration,
      wordCount: transcription.text.split(" ").length,
    });

  } catch (error) {
    // Clean up temp file on error
    await unlink(tmpFile).catch(() => {});
    console.error("Transcription error:", error.message);
    return NextResponse.json(
      { error: "Transcription failed: " + error.message },
      { status: 500 }
    );
  }
}

// ─── Fallback: YouTube Auto-Captions (no API key needed) ───
async function fetchYouTubeCaptions(url) {
  try {
    const ytdl = require("@distube/ytdl-core");
    const info = await ytdl.getInfo(url);

    // Check for caption tracks
    const tracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ error: "No auto-captions available for this video. Add OPENAI_API_KEY for AI transcription." }, { status: 404 });
    }

    // Prefer English
    const track = tracks.find(t => t.languageCode === "en") ||
                  tracks.find(t => t.languageCode.startsWith("en")) ||
                  tracks[0];

    const captionUrl = track.baseUrl + "&fmt=json3";
    const response = await fetch(captionUrl);
    const data = await response.json();

    const segments = (data.events || [])
      .filter(e => e.segs)
      .map(e => ({
        start: (e.tStartMs || 0) / 1000,
        end: ((e.tStartMs || 0) + (e.dDurationMs || 2000)) / 1000,
        text: e.segs.map(s => s.utf8 || "").join("").replace(/\n/g, " ").trim(),
      }))
      .filter(s => s.text.length > 1);

    return NextResponse.json({
      success: true,
      title: info.videoDetails.title,
      transcript: segments.map(s => s.text).join(" "),
      segments,
      language: track.languageCode,
      source: "youtube-captions",
      note: "Using YouTube auto-captions. Add OPENAI_API_KEY to .env.local for AI-powered Whisper transcription.",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch captions: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "YTFlow Transcription API",
    usage: "POST with { url: string, language?: string }",
    setup: "Add OPENAI_API_KEY to .env.local for Whisper AI. Without it, falls back to YouTube auto-captions.",
  });
}
