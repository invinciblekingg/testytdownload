// src/app/api/download/route.js
// Next.js 14 App Router — Video Download Endpoint
// Setup: npm install ytdl-core @distube/ytdl-core

import { NextResponse } from "next/server";

/**
 * GET /api/download?url=<youtube_url>&format=mp4&quality=1080p
 * Streams the video directly to the client browser
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "mp4";
  const quality = searchParams.get("quality") || "1080p";

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{8,}/;
  if (!ytRegex.test(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    // ─── PRODUCTION: Using @distube/ytdl-core (maintained fork) ───
    // npm install @distube/ytdl-core
    const ytdl = require("@distube/ytdl-core");

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim();

    let chosenFormat;
    if (format === "mp3") {
      // Audio only
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      chosenFormat = audioFormats.sort((a, b) =>
        parseInt(b.audioBitrate || 0) - parseInt(a.audioBitrate || 0)
      )[0];
    } else {
      // Video + audio, try to match quality
      const qualityMap = {
        "4K": "2160p", "2K": "1440p", "1080p": "1080p",
        "720p": "720p", "480p": "480p", "360p": "360p",
      };
      const targetQuality = qualityMap[quality] || "1080p";
      const videoFormats = ytdl.filterFormats(info.formats, "videoandaudio");
      chosenFormat =
        videoFormats.find(f => f.qualityLabel === targetQuality) ||
        videoFormats.find(f => f.qualityLabel === "720p") ||
        videoFormats[0];
    }

    if (!chosenFormat) {
      return NextResponse.json({ error: "No suitable format found" }, { status: 404 });
    }

    // Stream response
    const stream = ytdl(url, { format: chosenFormat });
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const mimeTypes = {
      mp4: "video/mp4",
      webm: "video/webm",
      mp3: "audio/mpeg",
    };
    const ext = format === "mp3" ? "mp3" : format;
    const filename = `${title.substring(0, 60)}.${ext}`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[format] || "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error.message);
    return NextResponse.json(
      { error: "Failed to download video. The video may be age-restricted or unavailable.", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/download
 * Get video info without downloading
 */
export async function POST(request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const ytdl = require("@distube/ytdl-core");
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;

    const formats = info.formats
      .filter(f => f.hasVideo || f.hasAudio)
      .map(f => ({
        itag: f.itag,
        quality: f.qualityLabel || f.audioBitrate + "kbps",
        container: f.container,
        hasVideo: f.hasVideo,
        hasAudio: f.hasAudio,
        filesize: f.contentLength ? parseInt(f.contentLength) : null,
      }))
      .slice(0, 20);

    return NextResponse.json({
      success: true,
      video: {
        id: details.videoId,
        title: details.title,
        channel: details.author?.name,
        duration: details.lengthSeconds,
        views: details.viewCount,
        thumbnail: details.thumbnails?.at(-1)?.url || `https://img.youtube.com/vi/${details.videoId}/maxresdefault.jpg`,
        formats,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
