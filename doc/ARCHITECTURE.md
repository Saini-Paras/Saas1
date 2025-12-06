# Architecture Documentation: Holo's Dashboard

## 1. Overview
Holo's Dashboard is a React-based personal utility application designed for Shopify automation, data processing, and frontend development tasks. It uses a component-based architecture with a shared UI library and serverless API functions.

**Recent Update (Phase 6):** The application has been refactored into a modular architecture to support scalability and easier maintenance.

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
│   ├── import_collections.js
│   ├── fetch_collections.js
│   ├── create_menu.js
│   └── oauth_exchange.js
├── config/                 # Configuration Files
│   └── tools.tsx           # Tool definitions & Category mappings
├── components/
│   ├── layout/             # Layout Components
│   │   ├── Header.tsx      # Top Navigation
│   │   └── Sidebar.tsx     # Side Navigation
│   ├── tools/              # Individual Tool Logic
│   │   ├── ClassyPrefixer.tsx
│   │   ├── Extractor.tsx
│   │   ├── Importer.tsx
│   │   ├── JsonCreator.tsx
│   │   ├── MenuBuilder.tsx # Nested Menu Builder
│   │   ├── RemToPx.tsx
│   │   ├── ShopifyScraper.tsx
│   │   └── TagAutomation.tsx
│   ├── Common.tsx          # Shared UI Kit (Card, Button, Input, etc.)
│   ├── ToolRenderer.tsx    # Tool Rendering Logic (Switch)
│   └── Toast.tsx           # Notification System
├── doc/                    # Documentation
├── App.tsx                 # Main Layout Orchestrator
├── index.html              # Entry point & Tailwind Config
├── types.ts                # TypeScript Interfaces & Tool Definitions
└── utils.ts                # Helpers (Script loading, Copy to clipboard)
```

## 4. Key Architectural Decisions

### A. Modular "Orchestrator" Pattern
`App.tsx` has been slimmed down. It now acts as an orchestrator that:
- Manages Global State (Theme, Active Tool, Sidebar Open/Close).
- Loads Global Scripts.
- Composes `Sidebar`, `Header`, and `ToolRenderer`.

### B. Configuration-Driven Tools (`config/tools.tsx`)
Adding a tool no longer requires editing `App.tsx` deeply.
- **Tools Definition**: An array of `Tool` objects defining ID, Label, Icon, and Category.
- **Category Titles**: A mapping of category IDs to display titles.

### C. Isolated Tool Components
Each tool in `components/tools/` remains self-contained.
- **Menu Builder**: Uses recursive components (`RecursiveMenuItem`) defined *outside* the main component to preserve state during re-renders.
- **Common Components**: `Input`, `Button`, etc., use `React.forwardRef` to support advanced focus management (e.g., auto-focusing modals).

### D. Serverless APIs
The `api/` folder contains Node.js functions intended for Vercel Serverless deployment.
- **Shopify OAuth**: Handles the secure token exchange.
- **GraphQL Proxying**: Proxies requests to Shopify Admin API to avoid CORS issues on the frontend.

## 5. Theming System
- **Strategy**: Tailwind `darkMode: 'class'`.
- **Implementation**: `App.tsx` reads/writes to `localStorage` ('theme') and toggles the `dark` class on the `<html>` element.
- **Colors**:
  - Backgrounds: `#141414` (Body), `#1e1e1e` (Sidebar/Cards), `#171717` (Inputs).
  - Accent: `#146ef5` (Blue).

## 6. Global Script Loading
Instead of bundling heavy libraries like `JSZip` or `PapaParse`, they are loaded asynchronously via CDN in `App.tsx` using a utility `loadScript`. This keeps the initial bundle size small.