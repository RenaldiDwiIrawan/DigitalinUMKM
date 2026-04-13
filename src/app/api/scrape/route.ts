import { NextRequest } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Increase timeout for Vercel Pro if available

export async function POST(req: NextRequest) {
  const { query, location, lat, lng, limit, radius } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
      };

      try {
        await scrapeGoogleMaps({
          query,
          location,
          lat,
          lng,
          limit,
          radius,
          onLeadFound: (lead) => {
            send({ type: 'lead', data: lead });
          }
        });

        send({ type: 'done' });
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
