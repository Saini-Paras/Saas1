# Prompt Engineering History & Development Log

This document records the evolution of the project and the types of prompts used to build the current state.

## Phase 1: Porting & Initialization
**Context:** Converting a legacy HTML/JS dashboard into React.
*   **Prompt:** "Here is the code for a personal dashboard. Break this down into separate components (Common, Tools, Layout) and strict Typescript files."
*   **Outcome:** Creation of `Common.tsx`, `types.ts`, and individual tool files.

## Phase 2: Design Overhaul (The "Holo" Theme)
**Context:** Moving away from default dark mode to a specific aesthetic.
*   **Prompt:** "Update the UI. Sidebar is not covering height. Make black background lighter (#181818). Add an accent color (#146ef5). Add a light theme switch."
*   **Outcome:** Implementation of `App.tsx` theming logic, Tailwind config updates in `index.html`.

## Phase 3: Functionality Expansion
**Context:** Adding backend APIs and porting external HTML tools.
*   **Prompt:** "Integrate `extract_collections.js` and `import_collections.js`. Convert ClassyPrefixer and RemToPx to React."
*   **Outcome:** Creation of `api/` folder and new components in `components/tools/`.

## Phase 4: UX Refinements & Bug Fixing
**Context:** Fixing layout consistency and mobile responsiveness.
*   **Prompt:** "Design fixes: 1. Input boxes not taking full width. 2. Mobile horizontal scrolling issues. 3. 'Start Over' button responsive issues."
*   **Outcome:** Removal of `max-w` constraints, addition of `overflow-x-auto` for tables.

## Phase 5: New Feature (Shopify Scraper & Menu Builder)
**Context:** Adding complex tools with recursive logic and OAuth.
*   **Prompt:** "Integrate 'Shopify Nested Menu Builder' Tool into Existing SaaS. Extract API routes. Refactor UI/UX."
*   **Refinement:** "Add Shopify logo, fix mobile layout, change 'Disconnect' to 'Logout', allow hiding navbar on desktop."
*   **Outcome:** Creation of `MenuBuilder.tsx` with recursive components, `api/create_menu.js`, and sidebar toggle logic.

## Phase 6: Modular Refactor (Scalability)
**Context:** The `App.tsx` file became too large for AI context windows, causing generation failures.
*   **Prompt:** "Refactor App.tsx so that we can scale the app without regenerating the code that does not need updatation. Make a scalable strategy."
*   **Outcome:** Split `App.tsx` into `Sidebar.tsx`, `Header.tsx`, `ToolRenderer.tsx`, and `config/tools.tsx`.

---

## Guide for Future Prompts

When asking AI to modify this project, utilize the following context:

**1. Adding a new Tool:**
> "I want to add a new tool called [Name] in the [Category] category. Here is the logic: [Code/Description]. Please create the component in `components/tools/`, add it to `config/tools.tsx`, and register it in `components/ToolRenderer.tsx`."

**2. Modifying Layout:**
> "Update `components/layout/Sidebar.tsx` to change the hover behavior..." (Target specific files instead of "Update the app").

**3. Fixing Bugs:**
> "The [Tool Name] is overflowing on mobile. Please check the `overflow` properties in `components/tools/[ToolName].tsx`."