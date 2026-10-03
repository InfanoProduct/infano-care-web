import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    let targetUrl = urlParam;
    const isStreamMode = req.nextUrl.searchParams.get("stream") === "1" || req.nextUrl.searchParams.get("raw") === "1";
    const rangeHeader = req.headers.get("range");

    // 1. Check if target points to local upload path on disk
    if (targetUrl.includes("/uploads/")) {
      const uploadRelPath = targetUrl.substring(targetUrl.indexOf("/uploads/")).replace(/^\//, "");
      
      const candidatePaths = [
        path.resolve(process.cwd(), "..", "infano-care-api", uploadRelPath),
        path.resolve(process.cwd(), "public", uploadRelPath),
        path.resolve(process.cwd(), uploadRelPath),
        path.resolve(process.cwd(), "..", uploadRelPath),
      ];

      for (const diskPath of candidatePaths) {
        if (fs.existsSync(diskPath)) {
          const stats = fs.statSync(diskPath);
          const fileSize = stats.size;

          const baseHeaders: Record<string, string> = {
            "Content-Type": isStreamMode ? "application/octet-stream" : "application/pdf",
            "Content-Disposition": "inline",
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400, immutable",
            "X-Frame-Options": "ALLOWALL",
            "Content-Security-Policy": "frame-ancestors *",
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
          };

          // Handle HTTP 206 Partial Content (Range Request for progressive PDF loading)
          if (rangeHeader) {
            const parts = rangeHeader.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
              return new NextResponse(null, {
                status: 416,
                headers: { "Content-Range": `bytes */${fileSize}` },
              });
            }

            const chunkSize = end - start + 1;
            const buffer = Buffer.alloc(chunkSize);
            const fd = fs.openSync(diskPath, "r");
            fs.readSync(fd, buffer, 0, chunkSize, start);
            fs.closeSync(fd);

            return new Response(new Uint8Array(buffer), {
              status: 206,
              headers: {
                ...baseHeaders,
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Content-Length": String(chunkSize),
              },
            });
          }

          // Full file response
          const fileBuffer = fs.readFileSync(diskPath);
          return new Response(new Uint8Array(fileBuffer), {
            status: 200,
            headers: {
              ...baseHeaders,
              "Content-Length": String(fileSize),
            },
          });
        }
      }

      // If not on disk, construct URL to local API
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005/api";
      const domain = apiBase.replace(/\/api\/?$/, "");
      targetUrl = `${domain}/${uploadRelPath}`;
    }

    // 2. Fetch from URL (local API or remote server)
    const fetchHeaders: HeadersInit = {
      Accept: isStreamMode ? "application/octet-stream, */*" : "application/pdf, */*",
    };
    if (rangeHeader) {
      fetchHeaders["Range"] = rangeHeader;
    }

    let res: Response;
    try {
      res = await fetch(targetUrl, { headers: fetchHeaders });
    } catch {
      if (targetUrl.includes("/uploads/")) {
        const localApiUrl = `http://localhost:4005/${targetUrl.substring(targetUrl.indexOf("/uploads/")).replace(/^\//, "")}`;
        res = await fetch(localApiUrl, { headers: fetchHeaders });
      } else {
        throw new Error("Could not reach PDF source");
      }
    }

    if (!res.ok && res.status !== 206) {
      return new NextResponse(`Failed to fetch PDF: ${res.statusText}`, { status: res.status });
    }

    const data = await res.arrayBuffer();
    const status = res.status === 206 ? 206 : 200;

    const responseHeaders: Record<string, string> = {
      "Content-Type": isStreamMode ? "application/octet-stream" : "application/pdf",
      "Content-Length": String(data.byteLength),
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400, immutable",
      "X-Frame-Options": "ALLOWALL",
      "Content-Security-Policy": "frame-ancestors *",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    };

    const contentRange = res.headers.get("content-range");
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }

    return new Response(new Uint8Array(data), {
      status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new NextResponse(`Error proxying PDF: ${err.message}`, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  return GET(req);
}
