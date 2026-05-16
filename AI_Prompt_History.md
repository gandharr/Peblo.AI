Conversation Summary - AI Prompt History

1. Conversation Overview:
- Primary Objectives:
  - Fix CI build failure: 'Cannot find native binding' when Vite loads vite.config.ts due to @tailwindcss/oxide. (CI hygiene: force fresh installs).
  - Implement multiple UI and feature requests safely: autosave indicator, archive notes, filtering/sorting UI, .env.example, architecture diagram, demo video, Express backend + REST APIs with rate limiting and validation, optimistic UI, dark/light toggle, markdown preview, keyboard shortcuts, unit tests — applied carefully to avoid breaking production.
- Session Context:
  - Iterative work performed: CI fixes → UI adjustments (logo, auth page size, scrollbars, favicons) → documentation rewrite (README + screenshots) → rename project to "Peblo AI" → push & verify GitHub Pages.

2. Technical Foundation:
- Frontend: React 19 + TypeScript, Vite, Tailwind CSS v4, motion, Lucide icons, react-markdown.
- Backend & AI: Firebase (Auth + Firestore), Gemini integration via `@google/genai` in `src/lib/gemini.ts`.
- CI/CD: GitHub Actions `.github/workflows/deploy.yml` building and uploading `dist/` and deploying to Pages.
- Packaging: `package.json`, `vite.config.ts`, `tsconfig.json` present.

3. Key Files Edited / Notes:
- `src/components/Logo.tsx`: refactor to accept `sizeClass` prop.
- `src/components/AuthPrompt.tsx`: larger logo sizing to suit auth page.
- `src/components/NoteEditor.tsx`: debounced autosave existed; attempted to add `savingStatus` and Archive button (patch failed originally); later reverted.
- `src/components/Dashboard.tsx`: real-time Firestore subscription; attempted filter/sort additions (then reverted).
- `src/components/Sidebar.tsx`: planned filter/sort UI (added then reverted).
- `src/lib/gemini.ts`: AI wrapper for Gemini.
- `src/types.ts`: added `isArchived?: boolean` to `Note` interface.
- `firestore.rules`: updated to validate `isArchived` boolean.
- `vite.config.ts`: `base: './'` set for GitHub Pages compatibility.
- `.env.example` and README updates present in repo.

4. Problems Encountered & Fixes:
- CI build inconsistency due to optional native bindings (e.g., `@tailwindcss/oxide`) causing cached installations to fail; updated Actions to clear npm cache and force fresh installs.
- `apply_patch` failed on `NoteEditor.tsx` due to context mismatch; fixed by re-opening and reapplying targeted edits.
- Duplicate useMemo closing lines inadvertently introduced in `Dashboard.tsx`, caused local build errors; this was fixed by removing the duplicated lines.
- Repository rename from `Peblo.AI` → `PebloAI` caused GitHub Pages 404 (old URL); updated `origin` remote and triggered a Pages redeploy. Also pushed an empty commit to retrigger Pages workflow.

5. Current State (as of last update):
- Local `npm run build` succeeds after fixes; `dist/` contains generated assets and `index.html` with relative paths (`./assets/...`) aligning with `base: './'`.
- Pages deploy triggered; ensure Actions run completes successfully and check Pages URL `https://gandharr.github.io/PebloAI/`.
- Reverted experimental additions (archive UI, autosave indicator, sidebar filters) after user requested revert.

6. Useful Commands & How to Generate PDF Locally
- To build and preview locally:

```bash
npm ci
npm run build
npm run dev
```

- To convert this markdown history to PDF locally using `pandoc` (recommended) or `wkhtmltopdf`:

```bash
# Using pandoc (requires LaTeX distribution for better formatting)
pandoc AI_Prompt_History.md -o AI_Prompt_History.pdf

# Or using wkhtmltopdf (converts rendered HTML to PDF)
# First convert markdown to HTML then to PDF
npx markdown-to-html AI_Prompt_History.md > history.html
wkhtmltopdf history.html AI_Prompt_History.pdf
```

7. Next Steps I can do for you
- Create a real `AI_Prompt_History.pdf` here (I can try to convert Markdown to PDF), but I may need permission to run external tools — I attempted builds earlier but hit rate limits on some agent tools; local conversion is recommended for best control.
- If you want the PDF committed to the repo immediately and you prefer I generate it here, confirm and I will attempt to run a conversion command and add the resulting `AI_Prompt_History.pdf` to the workspace.

---

If you'd like, I can also add a short changelog file with commit SHAs and timestamps for all the edits we made during this session. Let me know which format you prefer for the final PDF (simple text vs nicely formatted with headings and table of contents).