import { chromium as playwright, Browser } from 'playwright-core';

// We'll dynamically import playwright and @sparticuz/chromium based on environment
export async function getBrowser(): Promise<Browser> {
  // Option 1: Remote Browser (Recommended for Production)
  if (process.env.BROWSER_WS_ENDPOINT) {
    console.log('Connecting to remote browser...');
    return await playwright.connectOverCDP(process.env.BROWSER_WS_ENDPOINT);
  }

  // Option 2: Vercel / Serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    console.log('Detected serverless environment (Vercel/Lambda).');
    try {
      const chromium = (await import('@sparticuz/chromium-min')).default;

      // Try to find executable path.
      // We'll try to use a known stable version if the default fails.
      let executablePath: string;
      try {
        executablePath = await chromium.executablePath();
      } catch {
        console.log('Default executable path failed, trying with remote pack...');
        executablePath = await chromium.executablePath(
          'https://github.com/sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar'
        );
      }

      console.log('Launching playwright-core with executablePath:', executablePath);
      return await playwright.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    } catch (error: any) {
      console.error('CRITICAL: Failed to launch serverless chromium:', error);

      // Provide fallback to connection if endpoint exists
      if (process.env.BROWSER_WS_ENDPOINT) {
        return await playwright.connectOverCDP(process.env.BROWSER_WS_ENDPOINT);
      }

      // Throw a more descriptive error so the user can see what's wrong
      throw new Error(`Browser launch failed: ${error.message || 'Unknown error'}. Check Vercel logs for stack trace.`);
    }
  }

  // Option 3: Local environment
  console.log('Launching browser in local environment...');
  try {
    // Attempt to use local playwright installation
    console.log('Attempting to import playwright...');
    const { chromium } = await import('playwright');
    console.log('Launching chromium...');
    return await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  } catch (error: any) {
    console.warn(`Full playwright package failed: ${error.message}. Falling back to playwright-core.`);

    // Fallback to playwright-core
    const commonPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome-stable',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    ];

    for (const path of commonPaths) {
      try {
        console.log(`Trying executablePath: ${path}`);
        return await playwright.launch({
          headless: true,
          executablePath: path,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
      } catch (e: any) {
        console.log(`Failed at ${path}: ${e.message}`);
      }
    }

    // Last resort: try to find it via which command
    try {
      const { execSync } = await import('child_process');
      const chromePath = execSync('which google-chrome || which chromium').toString().trim();
      if (chromePath) {
        console.log(`Found path via which: ${chromePath}`);
        return await playwright.launch({
          headless: true,
          executablePath: chromePath,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
      }
    } catch (e) {}

    console.error('Final attempt: launching without executablePath (may fail if browsers not installed)');
    return await playwright.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
}
