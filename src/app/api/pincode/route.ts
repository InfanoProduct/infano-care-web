import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();
  const regionParam = searchParams.get('region');

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  // If region is omitted, default to the original IN raw response behavior for backward compatibility
  if (!regionParam) {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
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

  const region = regionParam.toUpperCase();

const INDIA_STATE_ALIASES: Record<string, string> = {
  'chattisgarh': 'Chhattisgarh',
  'chhattisgarh': 'Chhattisgarh',
  'orissa': 'Odisha',
  'odisha': 'Odisha',
  'pondicherry': 'Puducherry',
  'puducherry': 'Puducherry',
  'uttaranchal': 'Uttarakhand',
  'uttarakhand': 'Uttarakhand',
  'delhi': 'Delhi',
  'newdelhi': 'Delhi',
  'nationalcapitalterritoryofdelhi': 'Delhi',
  'nctofdelhi': 'Delhi',
  'jammuandkashmir': 'Jammu and Kashmir',
  'jammukashmir': 'Jammu and Kashmir',
  'andamanandnicobar': 'Andaman and Nicobar Islands',
  'andamanandnicobarislands': 'Andaman and Nicobar Islands',
  'andamannicobar': 'Andaman and Nicobar Islands',
  'dadraandnagarhaveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'damananddiu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadraandnagarhavelianddamananddiu': 'Dadra and Nagar Haveli and Daman and Diu',
  'telengana': 'Telangana',
  'telangana': 'Telangana',
};

const CANONICAL_INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function normalizeIndianStateName(rawState: string): string {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (INDIA_STATE_ALIASES[clean]) return INDIA_STATE_ALIASES[clean];
  const exact = CANONICAL_INDIA_STATES.find(s => s.toLowerCase().replace(/[^a-z0-9]/g, '') === clean);
  if (exact) return exact;
  const partial = CANONICAL_INDIA_STATES.find(s => clean.includes(s.toLowerCase().replace(/[^a-z0-9]/g, '')) || s.toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean));
  return partial || rawState;
}

  if (region === 'IN') {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      if (!res.ok) {
        return NextResponse.json({ error: 'Failed to fetch pincode data from external API' }, { status: res.status });
      }
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
        const postOffice = data[0].PostOffice[0];
        const canonicalState = normalizeIndianStateName(postOffice.State);
        return NextResponse.json({
          success: true,
          city: postOffice.District,
          state: canonicalState,
        });
      }
      return NextResponse.json({ error: 'Pincode not found' }, { status: 404 });
    } catch (err: any) {
      console.error('Error fetching pincode:', err);
      return NextResponse.json({ error: 'Internal server error while fetching pincode' }, { status: 500 });
    }
  }

  if (region === 'US') {
    if (!/^\d{5}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid US ZIP code format (5 digits required)' }, { status: 400 });
    }
    try {
      const res = await fetch(`https://api.zippopotam.us/us/${code}`);
      if (!res.ok) {
        return NextResponse.json({ error: 'ZIP code not found' }, { status: 404 });
      }
      const data = await res.json();
      if (data && data.places && data.places[0]) {
        const place = data.places[0];
        return NextResponse.json({
          success: true,
          city: place['place name'],
          state: place['state abbreviation'] || place['state'],
          stateCode: place['state abbreviation'],
          stateName: place['state'],
        });
      }
      return NextResponse.json({ error: 'ZIP code details not found' }, { status: 404 });
    } catch (err: any) {
      console.error('Error fetching US ZIP code:', err);
      return NextResponse.json({ error: 'Internal server error while fetching ZIP code' }, { status: 500 });
    }
  }

  if (region === 'UK') {
    const cleanCode = code.replace(/\s+/g, '').toUpperCase();
    if (cleanCode.length < 5 || cleanCode.length > 8) {
      return NextResponse.json({ error: 'Invalid UK postcode length' }, { status: 400 });
    }
    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${cleanCode}`);
      if (!res.ok) {
        return NextResponse.json({ error: 'Postcode not found' }, { status: 404 });
      }
      const data = await res.json();
      if (data && data.status === 200 && data.result) {
        const result = data.result;
        return NextResponse.json({
          success: true,
          city: result.admin_district || result.parish || '',
          state: result.admin_county || result.region || result.country || '',
        });
      }
      return NextResponse.json({ error: 'Postcode details not found' }, { status: 404 });
    } catch (err: any) {
      console.error('Error fetching UK postcode:', err);
      return NextResponse.json({ error: 'Internal server error while fetching postcode' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unsupported region' }, { status: 400 });
}
