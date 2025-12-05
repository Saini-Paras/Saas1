# Prompt Engineering History & Development Log

This document records the evolution of the project and the types of prompts used to generate the current state. Use this as a reference for context when asking an AI to modify the project further.

## Phase 1: Porting & Initialization
**Context:** Converting a legacy HTML/JS dashboard into React.
*   **Prompt:** "Here is the code for a personal dashboard [provided App.jsx code]. First, break this down into separate components (Common, Tools, Layout) and strict Typescript files."
*   **Outcome:** Creation of `Common.tsx`, `types.ts`, and individual tool files.

## Phase 2: Design Overhaul (The "Holo" Theme)
**Context:** Moving away from the default generic dark mode to a specific aesthetic.
*   **Prompt:** "Update the UI. Sidebar is not covering height. Make black background lighter (#181818). Add an accent color. Add a light theme switch."
*   **Refinement Prompt:** "Use Webflow-inspired aesthetics. Clean whites/grays, Blue #146ef5 accent. Crisper borders. Change user profile to 'Holo Drifter'."
*   **Outcome:** Implementation of `App.tsx` theming logic, Tailwind config updates in `index.html`, and `Common.tsx` styling updates.

## Phase 3: Functionality Expansion
**Context:** Adding backend APIs and porting external HTML tools.
*   **Prompt:** "The old app had an api folder. Integrate `extract_collections.js` and `import_collections.js`."
*   **Prompt:** "Here is code for two other tools (ClassyPrefixer and RemToPx) written in vanilla HTML/JS. Convert them to fit our React theme."
*   **Outcome:** Creation of `api/` folder and new components in `components/tools/`.

## Phase 4: UX Refinements & Bug Fixing
**Context:** Fixing layout consistency and mobile responsiveness.
*   **Prompt:** "UI Changes: On Overview show all tools. Create tabs for categories. Fix sidebar height."
*   **Prompt:** "Design fixes: 1. Input boxes not taking full width. 2. Mobile horizontal scrolling issues. 3. 'Start Over' button responsive issues."
*   **Specific Instruction:** "Make background colors #171717 for inputs."
*   **Outcome:** Removal of `max-w` constraints, addition of `overflow-x-auto` for tables, responsiveness adjustments.

## Phase 5: New Feature (Shopify Scraper)
**Context:** Adding a complex tool with logic from another source.
*   **Prompt:** "Add this new shopify tool [provided code]. Adjust design to match ours."
*   **Outcome:** Creation of `ShopifyScraper.tsx` adapting the logic to use `Common` UI components.

---

## Guide for Future Prompts

When asking AI to modify this project, utilize the following context:

**1. Adding a new Tool:**
> "I want to add a new tool called [Name]. It should be in the [Shopify/Web] category. Here is the logic: [Code/Description]. Please create the component in `components/tools/`, add the ID to `types.ts`, and register it in `App.tsx`."

**2. modifying UI:**
> "Update the [Component] to use the global input background color (#171717) and ensure it uses the `Card` component from `Common.tsx`."

**3. Fixing Bugs:**
> "The [Tool Name] is overflowing on mobile. Please check the `overflow` properties and ensure buttons have `shrink-0` or `whitespace-nowrap` if necessary."
