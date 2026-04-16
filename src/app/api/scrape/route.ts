import { NextRequest } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

/**
 * VERCEL TIMEOUT NOTES:
 * - Hobby/Free: max 10 seconds (cannot be increased)
 * - Pro/Enterprise: can be increased up to 900s
 *
 * To bypass the 10s limit on Free tier:
 * 1. Use a remote browser (Browserless.io) + Edge runtime (30s limit for streaming)
 *    Uncomment the line below if you have BROWSER_WS_ENDPOINT configured:
 */
// export const runtime = 'edge';

export const maxDuration = 60; // Applies to Pro tier

export async function POST(req: NextRequest) {
  const { query, location, lat, lng, limit, radius, shouldScrapeEmail, offset } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        const result = await scrapeGoogleMaps({
          query,
          location,
          lat,
          lng,
          limit,
          radius,
          offset: offset || 0,
          shouldScrapeEmail: shouldScrapeEmail || false,
          onLeadFound: (lead) => {
            send({ type: 'lead', data: lead });
          }
        });

        send({ type: 'done', isDone: result.isDone });
        controller.close();
      } catch (error: any) {
        send({ type: 'error', message: error.message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
