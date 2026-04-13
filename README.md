# DigitalinUMKM ⚡
### AI-Powered Sales Studio & Lead Generation for MSMEs

**DigitalinUMKM** is an elite, all-in-one studio designed to empower local MSMEs (UMKM) through instant digitalization. It combines a powerful real-time Google Maps scraper with a premium website template builder, allowing sales teams to find, target, and transform businesses in minutes.

---

## ✨ Key Features

- **🎯 Precision Lead Generation**: Real-time Google Maps scraping with automated data enrichment (Phone, Email, Website).
- **📍 Smart Location Autocomplete**: Custom location suggestion system powered by Google Maps (no API key required), providing high accuracy for target locations.
- **📋 Elite Leads Management**: Minimalist, high-performance dashboard with persistent data storage (`localStorage`).
- **📥 Pro Data Portability**: Export high-value leads directly to CSV for CRM integration.
- **🎨 Premium Website Templates**: Instant, high-end "Elite Edition" templates for Cafes and Petshops, designed with minimalist and elegant aesthetics.
- **⚡ AI-Ready Outreach**: Integrated prompts and templates to streamline client acquisition.
- **📱 Ultra-Responsive Design**: A sleek, glassmorphic UI optimized for both desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 (Theme-driven, Layer-based)
- **Automation**: Playwright (Advanced Web Scraping)
- **State Management**: React Context API with persistence
- **Icons**: Lucide React
- **UI Components**: Radix UI + Custom Glassmorphism

---

## 📂 Project Structure

- `src/app/`: Core application logic, pages, and server actions.
- `src/components/dashboard/`: High-end UI components for the leads ecosystem.
- `src/components/templates/`: Premium, customizable website templates.
- `src/lib/`: Core utilities, distance calculations, and scraping engine.
- `src/context/`: Global state with persistence layers.
- `docs/`: Strategic documentation and outreach templates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/DigitalinUMKM.git
   cd DigitalinUMKM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize Playwright:
   ```bash
   npx playwright install chromium
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:8088](http://localhost:8088) to start your session.

---

## 🌐 Deployment

### Vercel
DigitalinUMKM is optimized for Vercel. For high-reliability scraping in production:
1. Set the environment variable `BROWSER_WS_ENDPOINT` to a remote browser provider (like Browserless.io) in the Vercel dashboard.
2. If running locally or on a standard server, ensure Playwright browsers are installed (`npx playwright install chromium`).

---

## 📄 License

This project is licensed under the MIT License.

---

© 2026 • **DIGITALINUMKM** • *Go Digital Tanpa Drama*
