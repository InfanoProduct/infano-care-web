import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MASK_KEY_32 = 0x5a5a5a5a;
const MASK_KEY_8 = 0x5a;

function maskBuffer(input: Buffer | Uint8Array): Uint8Array {
  const output = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  const u32 = new Uint32Array(output.buffer, output.byteOffset, Math.floor(output.byteLength / 4));
  for (let i = 0; i < u32.length; i++) {
    u32[i] ^= MASK_KEY_32;
  }
  const remainderStart = u32.length * 4;
  for (let i = remainderStart; i < output.byteLength; i++) {
    output[i] ^= MASK_KEY_8;
  }
  return output;
}

/**
 * Protected binary stream endpoint for in-app eBook reader.
 * Masks magic PDF headers and uses application/octet-stream to prevent external
 * download managers (like IDM) from sniffing '%PDF-' signatures and hijacking the stream.
 */
export async function GET(req: NextRequest) {
  const docParam = req.nextUrl.searchParams.get("doc") || req.nextUrl.searchParams.get("url");
  if (!docParam) {
    return new NextResponse("Missing document identifier", { status: 400 });
  }

  try {
    let rawUrl = docParam;
    try {
      if (!rawUrl.startsWith("http") && !rawUrl.startsWith("/")) {
        const decoded = Buffer.from(rawUrl, "base64").toString("utf-8");
        if (decoded.includes("/") || decoded.startsWith("http")) {
          rawUrl = decoded;
        }
      }
    } catch {}

    let targetUrl = rawUrl;

    // 1. Check local uploads on disk
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
          const rawBuffer = fs.readFileSync(diskPath);
          const masked = maskBuffer(rawBuffer);

          return new Response(Buffer.from(masked), {
            status: 200,
            headers: {
              "Content-Type": "application/octet-stream",
              "Content-Disposition": "inline",
              "Content-Length": String(masked.byteLength),
              "Cache-Control": "public, max-age=86400, immutable",
              "X-Content-Type-Options": "nosniff",
              "X-Infano-Masked": "1",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      // Local API proxy
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005/api";
      const domain = apiBase.replace(/\/api\/?$/, "");
      targetUrl = `${domain}/${uploadRelPath}`;
    }

    // 2. Fetch from remote or local server
    let res: Response;
    try {
      res = await fetch(targetUrl);
    } catch {
      if (targetUrl.includes("/uploads/")) {
        const localApiUrl = `http://localhost:4005/${targetUrl.substring(targetUrl.indexOf("/uploads/")).replace(/^\//, "")}`;
        res = await fetch(localApiUrl);
      } else {
        throw new Error("Could not reach book document stream");
      }
    }

    if (!res.ok) {
      return new NextResponse(`Failed to stream book: ${res.statusText}`, { status: res.status });
    }

    const data = await res.arrayBuffer();
    const masked = maskBuffer(new Uint8Array(data));

    return new Response(Buffer.from(masked), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(masked.byteLength),
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
        "X-Infano-Masked": "1",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error reading book: ${err.message}`, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  return GET(req);
}
