#!/bin/bash

# Skills Helper for DigitalinUMKM
# Digunakan untuk menjalankan berbagai tugas operasional dengan mudah.

function help() {
    echo "Usage: ./skills.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev                               - Jalankan Dashboard Web (Port: 8088)"
    echo "  clean                             - Bersihkan folder .next dan cache"
    echo "  results                           - Tampilkan daftar hasil scraping terbaru"
    echo "  health                            - Jalankan cek kesehatan localhost"
}

function dev() {
    echo "🌐 Memulai Dashboard Web di http://localhost:8088"
    npm run dev
}

function clean() {
    echo "🧹 Membersihkan folder .next..."
    rm -rf .next
    echo "Done."
}

function results() {
    echo "📊 Hasil Scraping Terbaru (tools/scraper/results/):"
    ls -lt tools/scraper/results | head -n 10
}

function health() {
    echo "🏥 Menjalankan Health Check..."
    npx tsx scripts/check-health.ts
}

case "$1" in
    dev)
        dev
        ;;
    clean)
        clean
        ;;
    results)
        results
        ;;
    health)
        health
        ;;
    *)
        help
        ;;
esac
