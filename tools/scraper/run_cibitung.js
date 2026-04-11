const { scrapeGoogleMaps } = require('./gmaps_scraper');

async function run() {
  console.log("=== Memulai Scraping di Area RS EMC Cibitung ===\n");

  // Mencari Cafe
  await scrapeGoogleMaps('Cafe', 'dekat RS EMC Cibitung', 5);

  console.log("\n-------------------------------------------\n");

  // Mencari Petshop
  await scrapeGoogleMaps('Petshop', 'dekat RS EMC Cibitung', 5);

  console.log("\n=== Scraping Selesai! ===");
}

run();
