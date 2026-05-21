import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch pincode data from external API' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching pincode:', err);
    return NextResponse.json({ error: 'Internal server error while fetching pincode' }, { status: 500 });
  }
}
