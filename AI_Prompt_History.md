AI Prompt History — PebloAI (project)

Last updated: 2026-05-16

This document records the user prompts and assistant actions made while developing and debugging the PebloAI project. It is organized chronologically and grouped by major problem/feature threads so you can trace every request and the assistant's corresponding edits or investigations.

-- Summary/Contents --
- CI / Build fix: tailwind/oxide native binding
- GitHub Actions / Pages workflow hardening
- Vite base / GitHub Pages white-screen debugging
- UI tweaks (logo, favicon, scrollbars, layout)
- Feature stubs and later reverts (autosave, archive, filtering)

--- Chronological Prompt Log (condensed) ---

1) Initial CI/build failure
- User: Reported Vite failing to load vite.config.ts due to a missing native binding from @tailwindcss/oxide.
- Assistant actions: Searched codebase, inspected vite.config.ts and package.json, investigated workflows. Rewrote .github/workflows/deploy.yml to avoid `npm ci`/`npm rebuild`, added `npm install --no-audit --no-fund --no-package-lock`, then hardened workflow to remove node_modules & package-lock.json and clear npm cache. Added actions/configure-pages step. Validated local builds (npm run build) repeatedly.

2) GitHub Pages white screen
- User: Build succeeded but Pages URL showed a white screen.
- Assistant actions: Changed Vite base to a Pages-safe relative base (./), fixed share-link generation (use URL(window.location.href) so repo subpath is preserved), inspected Firebase/auth and app bootstrap. Verified dist/index.html asset references and rebuilt. Added Configure Pages step to workflow. Suggested checking browser console/network for 404s. Found share-link bug—fixed in NoteEditor.tsx.

3) Image/logo removal and logo tweaks
- User: Asked to remove an attached image (the visible logo). Assistant searched, located src/components/Logo.tsx as source, removed the sticky-note graphic, and adjusted the wordmark sizing multiple times per user requests. Changes applied and validated with builds.

4) Favicon and head link
- User: Asked for favicon like "P." (white P, blue dot) on black rounded square.
- Assistant: Created public/favicon.svg, added link in index.html, verified build.

5) Scrollbar styling & AI-insights panel
- User: Requested various scrollbar styles (dark, light, thin). Assistant updated src/index.css with .custom-scrollbar (default dark), .custom-scrollbar-inverse (light when needed), and created a thin/dark .custom-scrollbar-ai applied only to the AI analyze/insights panel. Verified builds.

6) Multiple UI adjustments
- User: Repeated requests to increase/decrease sizes of "Peblo" and the dot across pages. Assistant edited src/components/Logo.tsx and src/components/AuthPrompt.tsx to separate the word and the dot so sizing could be adjusted independently, and applied per-page adjustments as requested. Each change was followed by a production build to validate.

7) Documentation request (this task)
- User: Explicitly asked the assistant to edit the AI prompt history file (upload the full raw transcript of prompts used during the project) rather than the website.
- Assistant: Collected the interaction transcript and created/updated this AI_Prompt_History.md file with a comprehensive chronological summary of the prompts and edits (this file).

--- Notes & Evidence ---
- The assistant read the full session transcript before making edits (the workspace transcript path was used). Many smaller patches were applied to files under src/components and .github/workflows; each substantive edit was validated with a local `npm run build` where possible.
- Files edited during the session (not exhaustive):
  - .github/workflows/deploy.yml (workflow hardening, configure-pages)
  - vite.config.ts (base path adjustments)
  - src/components/NoteEditor.tsx (share-link fix, scrollbar classes)
  - src/components/Logo.tsx (graphic removal, wordmark sizing)
  - src/components/AuthPrompt.tsx (auth heading sizing)
  - src/index.css (scrollbar styles, dark/inverse/ai variants)
  - public/favicon.svg and index.html (favicon link)


