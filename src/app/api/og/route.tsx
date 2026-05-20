import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic parameters
    const title = searchParams.get('title') || 'Empowering Girls through Health & Education';
    const author = searchParams.get('author') || 'Infano Care';
    const category = searchParams.get('category') || 'Healthcare';
    const readTime = searchParams.get('readTime') || '5 min read';

    // Renders the premium branded OG Image card
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '80px',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Glowing Branded Background Orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '500px',
              height: '500px',
              borderRadius: '250px',
              background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(244,63,94,0) 70%)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-200px',
              left: '-200px',
              width: '600px',
              height: '600px',
              borderRadius: '300px',
              background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0) 70%)',
              display: 'flex',
            }}
          />

          {/* Top Brand Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '22px',
                }}
              >
                i
              </div>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: 'white',
                  letterSpacing: '-0.03em',
                }}
              >
                infano<span style={{ color: '#f43f5e' }}>.care</span>
              </span>
            </div>

            {/* Category Tag */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.2)',
                padding: '8px 20px',
                borderRadius: '100px',
                color: '#f43f5e',
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title Overlay */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxWidth: '900px',
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? '48px' : '64px',
                fontWeight: '800',
                color: 'white',
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: '-0.02em',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Metabar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50px',
                  background: '#f43f5e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                  {author}
                </span>
                <span style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>
                  Author
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '16px' }}>
              <span>⏱️</span>
              <span style={{ fontWeight: '600' }}>{readTime}</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error('Failed to generate OG Image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
