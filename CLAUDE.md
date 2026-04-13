@AGENTS.md

# DigitalinUMKM Project Guidelines

## Project Structure
- `src/app/`: Next.js App Router pages and server actions.
- `src/components/dashboard/`: UI components for the lead generation dashboard.
- `src/components/templates/`: Website templates for business categories (Cafe, Petshop).
- `src/lib/`: Core logic and utilities (e.g., Google Maps scraper, browser manager).
- `tools/scraper/`: Independent scraper tool components and results.
- `public/docs/templates/`: Static documentation (e.g., PROMPT.md) linked in the UI.
- `docs/`: General project documentation.

## Development Commands
- `npm run dev`: Start development server on port 8088.
- `npm run build`: Build the production application.
- `npx tsx scripts/check-health.ts`: Run a basic health check on the local server.

## Coding Conventions
- Use `@/` path alias for all internal imports.
- Break down large components into modular sub-components in `src/components/`.
- Use Server Actions (`src/app/actions.ts`) for data fetching/processing.
- Use `DashboardContext` (`src/context/DashboardContext.tsx`) for global state management and `localStorage` persistence.
- Use `exportToCSV` utility in `src/lib/utils.ts` for data portability.
- Add `suppressHydrationWarning` to the `<body>` tag in `layout.tsx` to ignore browser extension interference.
