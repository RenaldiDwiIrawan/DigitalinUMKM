import { NextRequest, NextResponse } from 'next/server';
import { getBrowser } from '@/lib/browser';
import { findEmailFromWebsite, scrapeLeadDetailsByName } from '@/lib/scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Enrichment can take longer as it's a single item

export async function POST(req: NextRequest) {
  try {
    const { url, name, location, type } = await req.json();

    // Type 1: Email Enrichment (needs URL)
    if (type === 'email' || url) {
      if (!url) return NextResponse.json({ error: 'URL is required for email enrichment' }, { status: 400 });

      const browser = await getBrowser();
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      });
      const email = await findEmailFromWebsite(context, url);
      return NextResponse.json({ email });
    }

    // Type 2: Website/Details Enrichment (needs Name + Location)
    if (type === 'details' || (name && location)) {
      if (!name || !location) {
        return NextResponse.json({ error: 'Name and location are required' }, { status: 400 });
      }
      const details = await scrapeLeadDetailsByName(name, location);
      return NextResponse.json(details);
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('Enrichment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
