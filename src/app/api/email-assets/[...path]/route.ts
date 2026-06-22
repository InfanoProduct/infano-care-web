import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // In Next.js 15+, params is a Promise and must be awaited
    const { path: pathSegments } = await params;

    // Build the file path: pathSegments already contains ['assets', 'filename']
    // because the template uses IMAGE_BASE_URL + '/assets/filename'
    const filePath = path.join(
      process.cwd(),
      '..',
      'infano-care-api',
      'uploads',
      ...pathSegments
    );

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_MAP[ext] || 'application/octet-stream';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }
}
