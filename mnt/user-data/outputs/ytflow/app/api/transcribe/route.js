import { NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createReadStream } from "fs";

/**
 * POST /api/transcribe
 * Body: { url: string, language?: string }
 *
 * Flow:
 *   1. If OPENAI_API_KEY is set → download audio → transcribe with Whisper
 *   2. Else → fetch YouTube auto-captions directly (no API key needed)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const url = body?.url;
    const language = body?.language || "auto";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const ytRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{6,}/;
    if (!ytRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Extract video ID
    const vidMatch = url.match(
      /(?:v=|youtu\.be\/|shorts\/|embed\/)([a-zA-Z0-9_-]{6,})/
    );
    const videoId = vidMatch?.[1];
    if (!videoId) {
      return NextResponse.json({ error: "Could not extract video ID" }, { status: 400 });
    }

    // ── Path A: Whisper AI (requires OPENAI_API_KEY) ──────────────────────
    if (process.env.OPENAI_API_KEY) {
      return await whisperTranscribe(url, videoId, language);
    }

    // ── Path B: YouTube auto-captions (no API key needed) ─────────────────
    return await captionFallback(videoId);

  } catch (err) {
    console.error("[transcribe]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Whisper transcription ────────────────────────────────────────────────
async function whisperTranscribe(url, videoId, language) {
  const tmpDir = tmpdir();
  const tmpFile = join(tmpDir, `ytflow_${videoId}_${Date.now()}.mp4`);

  try {
    // Import ytdl-core dynamically
    let ytdl;
    try {
      const mod = await import("@distube/ytdl-core");
      ytdl = mod.default || mod;
    } catch {
      // ytdl not installed → fallback to captions
      return await captionFallback(videoId);
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;
    const duration = parseInt(details.lengthSeconds || 0);
    const title = details.title;

    if (duration > 1800) {
      return NextResponse.json(
        { error: "Video too long (max 30 min for Whisper transcription)." },
        { status: 400 }
      );
    }

    // Pick best audio format
    const audioFmts = ytdl.filterFormats(info.formats, "audioonly");
    const bestAudio = audioFmts.sort(
      (a, b) => parseInt(b.audioBitrate || 0) - parseInt(a.audioBitrate || 0)
    )[0];

    if (!bestAudio) {
      return await captionFallback(videoId);
    }

    // Download audio to temp file
    const stream = ytdl(url, { format: bestAudio });
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    await writeFile(tmpFile, Buffer.concat(chunks));

    // Transcribe with OpenAI Whisper
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tmpFile),
      model: "whisper-1",
      language: language === "auto" ? undefined : language,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const segments = (transcription.segments || []).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    }));

    return NextResponse.json({
      success: true,
      title,
      transcript: transcription.text,
      segments,
      language: transcription.language || language,
      duration: transcription.duration || duration,
      wordCount: transcription.text?.split(" ").length || 0,
      source: "whisper",
    });

  } finally {
    // Always clean up the temp file
    await unlink(tmpFile).catch(() => {});
  }
}

// ─── YouTube caption fallback (no key needed) ────────────────────────────
async function captionFallback(videoId) {
  // Try to get captions via ytdl-core first (most reliable)
  try {
    const mod = await import("@distube/ytdl-core");
    const ytdl = mod.default || mod;
    const info = await ytdl.getInfo(
      `https://www.youtube.com/watch?v=${videoId}`
    );
    const title = info.videoDetails.title;

    const tracks =
      info.player_response?.captions
        ?.playerCaptionsTracklistRenderer?.captionTracks;

    if (tracks && tracks.length > 0) {
      const track =
        tracks.find((t) => t.languageCode === "en") ||
        tracks.find((t) => t.languageCode.startsWith("en")) ||
        tracks[0];

      const res = await fetch(`${track.baseUrl}&fmt=json3`);
      const data = await res.json();

      const segments = (data.events || [])
        .filter((e) => e.segs)
        .map((e) => ({
          start: (e.tStartMs || 0) / 1000,
          end: ((e.tStartMs || 0) + (e.dDurationMs || 2000)) / 1000,
          text: e.segs
            .map((s) => s.utf8 || "")
            .join("")
            .replace(/\n/g, " ")
            .trim(),
        }))
        .filter((s) => s.text.length > 1);

      if (segments.length > 0) {
        return NextResponse.json({
          success: true,
          title,
          transcript: segments.map((s) => s.text).join(" "),
          segments,
          language: track.languageCode,
          source: "youtube-captions",
          note: "Using YouTube auto-captions. Add OPENAI_API_KEY to .env.local for AI-powered Whisper transcription.",
        });
      }
    }

    // No captions found
    return NextResponse.json(
      {
        error:
          "No captions available for this video. Add OPENAI_API_KEY to .env.local for AI transcription of any video.",
      },
      { status: 404 }
    );

  } catch (err) {
    // Final fallback — helpful error
    return NextResponse.json(
      {
        error: `Could not fetch captions: ${err.message}. Add OPENAI_API_KEY to .env.local for full AI transcription.`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "YTFlow Transcription API — POST { url, language }",
    modes: {
      withOpenAI: "Set OPENAI_API_KEY in .env.local → uses Whisper AI for any video",
      withoutOpenAI: "Falls back to YouTube auto-captions (works for most public videos)",
    },
  });
}
