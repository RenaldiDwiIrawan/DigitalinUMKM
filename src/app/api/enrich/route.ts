import { NextRequest, NextResponse } from 'next/server';
import { getBrowser } from '@/lib/browser';
import { findEmailFromWebsite } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    });

    const email = await findEmailFromWebsite(context, url);

    // We don't close the browser here because getBrowser() returns a shared instance,
    // but the context should be closed. However, findEmailFromWebsite already handles
    // closing the specific page it creates.

    return NextResponse.json({ email });
  } catch (error: any) {
    console.error('Enrichment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
