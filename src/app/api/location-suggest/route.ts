import { NextResponse } from 'next/server';
import { getBrowser } from '@/lib/browser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Required for slow scraping tasks on Vercel Pro

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 3) {
    return NextResponse.json({ features: [] });
  }

  let browser;
  try {
    browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      locale: 'id-ID',
      timezoneId: 'Asia/Jakarta',
    });
    const page = await context.newPage();

    console.log(`Searching for location: ${query}`);

    // Go to Google Maps
    await page.goto('https://www.google.com/maps', { waitUntil: 'load', timeout: 20000 });

    // Handle Google Consent page if it appears
    try {
      const consentButton = page.locator('form[action*="consent.google.com"] button').first();
      if (await consentButton.isVisible({ timeout: 2000 })) {
        console.log('Accepting Google consent...');
        await consentButton.click();
        await page.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => {});
      }
    } catch (e) {
      // Consent page didn't appear or already accepted
    }

    // Type into search box
    const searchInput = 'input[name="q"]';
    await page.waitForSelector(searchInput, { timeout: 10000 });
    await page.fill(searchInput, query);

    // Wait for suggestions to appear
    await page.waitForTimeout(1500);

    // Extract suggestions
    const suggestions = await page.evaluate(() => {
      const items = document.querySelectorAll('.UaZMe, .GvS7Xd, .sbsb_c, [role="gridcell"]');
      return Array.from(items).map(el => {
        const text = (el as HTMLElement).innerText || '';
        const lines = text.split('\n').filter(line => line.trim().length > 0 && line !== '');

        return {
          name: lines[0] || '',
          address: lines.slice(1).join(', ') || ''
        };
      }).filter(s => s.name.length > 0);
    });

    console.log(`Found ${suggestions.length} suggestions`);

    // Map to the format expected by the frontend
    const features = suggestions.map(s => {
      const addressParts = s.address ? s.address.split(',') : [];
      return {
        properties: {
          name: s.name,
          display_address: s.address,
          district: '',
          city: addressParts[0]?.trim() || '',
          state: addressParts[1]?.trim() || '',
        }
      };
    });

    return NextResponse.json({ features });
  } catch (error: any) {
    console.error('Location suggest error:', error);
    return NextResponse.json({ features: [], error: error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close().catch(err => console.error('Error closing browser:', err));
    }
  }
}
