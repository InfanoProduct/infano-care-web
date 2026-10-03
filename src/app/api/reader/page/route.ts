import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Next.js proxy for serving WebP page tiles (~40KB - 70KB).
 * Looks directly into the backend's rendered cache or proxies to the API.
 */
export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get("bookId") || req.nextUrl.searchParams.get("id") || "gigi-the-book";
  const page = req.nextUrl.searchParams.get("page") || "1";

  try {
    // 1. Check if rendered WebP tile exists on disk directly
    const candidatePaths = [
      path.resolve(process.cwd(), "..", "infano-care-api", "uploads", "books", "rendered", bookId, `page-${page}.webp`),
      path.resolve(process.cwd(), "..", "infano-care-api", "uploads", "books", "rendered", "gigi-the-ebook", `page-${page}.webp`),
      path.resolve(process.cwd(), "..", "infano-care-api", "uploads", "books", "rendered", "gigi-the-book", `page-${page}.webp`),
      path.resolve(process.cwd(), "public", "rendered", bookId, `page-${page}.webp`),
    ];

    for (const diskPath of candidatePaths) {
      if (fs.existsSync(diskPath)) {
        const fileBuffer = fs.readFileSync(diskPath);
        return new Response(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": "image/webp",
            "Content-Length": String(fileBuffer.byteLength),
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // 2. Fetch from backend API tile streamer
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005/api";
    const targetUrl = `${apiBase}/library/books/${encodeURIComponent(bookId)}/page/${encodeURIComponent(page)}`;

    const res = await fetch(targetUrl, { cache: "no-store" });
    if (!res.ok) {
      return new NextResponse(`Page not found`, { status: res.status });
    }

    const data = await res.arrayBuffer();
    return new Response(Buffer.from(data), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(data.byteLength),
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Failed to stream page: ${err.message}`, { status: 500 });
  }
}
