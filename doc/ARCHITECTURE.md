# Architecture Documentation: Holo's Dashboard

## 1. Overview
Holo's Dashboard is a React-based personal utility application designed for Shopify automation, data processing, and frontend development tasks. It uses a component-based architecture with a shared UI library and serverless API functions.

## 2. Tech Stack
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Dark mode via 'class' strategy)
- **Icons**: Lucide React
- **External Libraries**: PapaParse (CSV), JSZip (Compression) - loaded via CDN.

## 3. File Structure
```
/
├── api/                    # Serverless functions (Vercel-compatible)
│   ├── extract_collections.js
│   └── import_collections.js
├── components/
│   ├── tools/              # Individual Tool Logic
│   │   ├── ClassyPrefixer.tsx
│   │   ├── Extractor.tsx
│   │   ├── Importer.tsx
│   │   ├── JsonCreator.tsx
│   │   ├── RemToPx.tsx
│   │   ├── ShopifyScraper.tsx
│   │   └── TagAutomation.tsx
│   ├── Common.tsx          # Shared UI Kit (Card, Button, Input, etc.)
│   └── Toast.tsx           # Notification System
├── doc/                    # Documentation
├── App.tsx                 # Main Layout, Routing, and State
├── index.html              # Entry point & Tailwind Config
├── types.ts                # TypeScript Interfaces & Tool Definitions
└── utils.ts                # Helpers (Script loading, Copy to clipboard)
```

## 4. Key Architectural Decisions

### A. The "Monolithic" App Component
`App.tsx` handles the primary layout responsibilities:
- **State Management**: Manages `activeCategory`, `activeToolId`, `theme`, and `notification` state.
- **Routing**: Instead of React Router, it uses conditional rendering based on state to switch between the Overview dashboard and specific Tools.
- **Sidebar & Navigation**: Handles responsiveness (collapsible sidebar) and Category vs. Tool navigation logic.

### B. Shared Component Library (`Common.tsx`)
To ensure visual consistency, raw HTML elements are wrapped in `Common.tsx`:
- All inputs (`Input`, `TextArea`, `Select`) automatically handle Dark/Light mode styling (`bg-[#171717]`, border colors, etc.).
- `Button` abstracts variants (Primary, Secondary, Ghost).
- `Card` provides the standard container with borders and padding.

### C. Tool Isolation
Each tool in `components/tools/` is self-contained.
- They accept props usually limited to `notify` (for toasts) and `libsLoaded` (if they need global scripts).
- They manage their own internal state.
- They do not affect the global app state directly.

### D. Serverless APIs
The `api/` folder contains Node.js functions intended for Vercel Serverless deployment.
- These are necessary for operations that require CORS handling or server-side requests (e.g., Shopify API interaction).
- **Proxying**: The Frontend tools often use `api.allorigins.win` or the internal `api/` folder to bypass CORS when scraping.

## 5. Theming System
- **Strategy**: Tailwind `darkMode: 'class'`.
- **Implementation**: `App.tsx` reads/writes to `localStorage` ('theme') and toggles the `dark` class on the `<html>` element.
- **Colors**:
  - Backgrounds: `#141414` (Body), `#1e1e1e` (Sidebar/Cards), `#171717` (Inputs).
  - Accent: `#146ef5` (Blue).

## 6. Global Script Loading
Instead of bundling heavy libraries like `JSZip` or `PapaParse`, they are loaded asynchronously via CDN in `App.tsx` using a utility `loadScript`. This keeps the initial bundle size small.
