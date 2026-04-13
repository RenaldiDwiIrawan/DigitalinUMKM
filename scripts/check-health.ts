import { getBrowser } from '../src/lib/browser';

async function testLocalhost() {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    console.log('Checking http://localhost:8088...');
    const response = await page.goto('http://localhost:8088', { timeout: 10000 });

    if (response?.status() === 200) {
      console.log('✅ Localhost is UP (Status 200)');

      const title = await page.title();
      console.log('Page Title:', title);

      const hasFilter = await page.isVisible('text=Filter');
      console.log('Has Filter section:', hasFilter);

      const hasTemplates = await page.isVisible('text=Katalog Template');
      console.log('Has Templates section:', hasTemplates);

    } else {
      console.error('❌ Localhost returned status:', response?.status());
    }
  } catch (error: any) {
    console.error('❌ Failed to connect to localhost:', error.message);
  } finally {
    await browser.close();
  }
}

testLocalhost();
