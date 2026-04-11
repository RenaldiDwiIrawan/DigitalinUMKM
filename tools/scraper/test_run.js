const { scrapeGoogleMaps } = require('./gmaps_scraper');

// Silakan ganti kata kunci dan lokasi sesuai keinginanmu
const query = 'Bengkel Mobil';
const location = 'Bintaro';
const limit = 5;

scrapeGoogleMaps(query, location, limit);
