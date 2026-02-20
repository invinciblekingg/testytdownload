import { NextResponse } from "next/server";

/**
 * POST /api/download
 * Body: { url: string }
 * Returns video metadata (title, channel, thumbnail, duration, formats)
 */
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const ytRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]{6,}/;
    if (!ytRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Dynamically import ytdl-core so the build doesn't fail if it's not installed
    let ytdl;
    try {
      const mod = await import("@distube/ytdl-core");
      ytdl = mod.default || mod;
    } catch {
      // Fall back to noembed if ytdl-core isn't available
      return await noembedFallback(url);
    }

    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;

    const videoId = details.videoId;
    const formats = info.formats
      .filter((f) => f.hasVideo && f.hasAudio)
      .slice(0, 10)
      .map((f) => ({
        itag: f.itag,
        quality: f.qualityLabel,
        container: f.container,
        filesize: f.contentLength ? parseInt(f.contentLength) : null,
      }));

    return NextResponse.json({
      success: true,
      video: {
        id: videoId,
        title: details.title,
        channel: details.author?.name,
        duration: details.lengthSeconds,
        views: details.viewCount,
        thumbnail:
          details.thumbnails?.at(-1)?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        formats,
      },
    });
  } catch (err) {
    console.error("[download POST]", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/download?url=...&format=mp4&quality=1080p
 * Streams the video file directly to the client browser.
 * Note: On Vercel free tier (10s timeout) this may cut off for large files.
 * Self-host or use Vercel Pro for reliable large-file streaming.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const format = searchParams.get("format") || "mp4";
  const quality = searchParams.get("quality") || "1080p";

  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  let ytdl;
  try {
    const mod = await import("@distube/ytdl-core");
    ytdl = mod.default || mod;
  } catch {
    // ytdl not available — redirect to cobalt.tools
    return NextResponse.redirect(
      `https://cobalt.tools/#u=${encodeURIComponent(url)}`
    );
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s-]/g, "").trim();

    let chosenFormat;
    if (format === "mp3") {
      const audioFmts = ytdl.filterFormats(info.formats, "audioonly");
      chosenFormat = audioFmts.sort(
        (a, b) => parseInt(b.audioBitrate || 0) - parseInt(a.audioBitrate || 0)
      )[0];
    } else {
      const qualityMap = {
        "4K": "2160p", "2K": "1440p", "1080p": "1080p",
        "720p": "720p", "480p": "480p", "360p": "360p",
      };
      const targetQ = qualityMap[quality] || "1080p";
      const videoFmts = ytdl.filterFormats(info.formats, "videoandaudio");
      chosenFormat =
        videoFmts.find((f) => f.qualityLabel === targetQ) ||
        videoFmts.find((f) => f.qualityLabel === "720p") ||
        videoFmts[0];
    }

    if (!chosenFormat) {
      return NextResponse.json({ error: "No suitable format found" }, { status: 404 });
    }

    // Stream the file
    const stream = ytdl(url, { format: chosenFormat });
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const mimeMap = { mp4: "video/mp4", webm: "video/webm", mp3: "audio/mpeg" };
    const ext = format === "mp3" ? "mp3" : format;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeMap[format] || "video/mp4",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(title.substring(0, 60))}.${ext}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[download GET]", err.message);
    // Graceful fallback
    return NextResponse.redirect(
      `https://cobalt.tools/#u=${encodeURIComponent(url)}`
    );
  }
}

// ─── Fallback when ytdl-core is unavailable ───────────────────────────────
async function noembedFallback(url) {
  try {
    const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{6,})/);
    const vid = match?.[1];
    if (!vid) throw new Error("Could not extract video ID");

    const res = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${vid}`
    );
    const data = await res.json();

    return NextResponse.json({
      success: true,
      video: {
        id: vid,
        title: data.title || "YouTube Video",
        channel: data.author_name || "Unknown",
        thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
        duration: null,
        formats: [],
      },
      note: "Install @distube/ytdl-core for full format info.",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
