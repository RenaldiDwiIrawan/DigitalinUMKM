import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Required for slow scraping tasks on Vercel Pro

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ features: [] });
  }

  try {
    console.log(`Searching for location: ${query}`);

    // Use Photon API (OpenStreetMap-based) which is free and reliable
    // We filter for Indonesia to improve relevance
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lat=-6.200000&lon=106.816666`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DigitalinUMKM/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Photon API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Photon data to match our frontend expectations if needed
    // Photon already returns "features" with "properties"
    const features = (data.features || []).map((f: any) => {
      const p = f.properties;

      // Create a nice display address
      const parts = [p.district, p.city, p.state].filter(Boolean);
      const display_address = parts.join(', ');

      return {
        properties: {
          name: p.name,
          display_address: display_address || p.country || '',
          district: p.district || '',
          city: p.city || '',
          state: p.state || '',
          country: p.country || ''
        },
        geometry: f.geometry
      };
    });

    console.log(`Found ${features.length} suggestions`);
    return NextResponse.json({ features });
  } catch (error: any) {
    console.error('Location suggest error:', error);
    return NextResponse.json({ features: [], error: error.message }, { status: 500 });
  }
}
