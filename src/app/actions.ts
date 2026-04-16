'use server'

import { scrapeGoogleMaps, ScrapeResult } from '@/lib/scraper';
import fs from 'fs';
import path from 'path';

export async function runScraper(query: string, location: string, limit: number = 10, radius?: number, shouldScrapeEmail: boolean = false) {
  try {
    const results = await scrapeGoogleMaps({ query, location, limit, radius, shouldScrapeEmail });

    // Handle persistence in the action layer
    // Skip file writing on Vercel as the filesystem is read-only
    if (!process.env.VERCEL) {
      try {
        const outputDir = path.join(process.cwd(), 'tools/scraper/results');
        const fileName = `leads_${query.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const filePath = path.join(outputDir, fileName);

        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

        console.log(`Successfully saved ${results.leads.length} results to ${filePath}`);
      } catch (fsError) {
        console.warn('Failed to save results to file (expected on Vercel):', fsError);
      }
    }

    return { success: true, data: results };
  } catch (error: any) {
    console.error('Action error:', error);
    return { success: false, error: error.message };
  }
}
