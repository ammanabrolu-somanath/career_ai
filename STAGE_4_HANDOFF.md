# AI-Based Smart Career Guidance System — Project Handoff (Post-Stage 4C)

This document is a continuation checkpoint. It was written immediately after
Stage 4C was completed and verified, before any further implementation work,
to allow a new session to resume with full context.

---

## 1. PROJECT OVERVIEW

**What it is:** An academic project — a standalone "AI-Based Smart Career
Guidance System" that recommends career paths based on a student's skills,
interests, and academic performance. It is explicitly **rule-based**, not
machine-learning-based. There is no login, no user accounts, no student
profile/auth system, and none should be added unless explicitly requested.

**Backend (Flask, Python):**
- Plain Python data structures throughout — no database.
- Student profiles stored in an in-memory Python dict (`data/student_profiles.py`),
  looked up via `dict.get()` — genuine average O(1) hash-based lookup.
- Careers/skills/interests modeled as a directed adjacency-list graph
  (`data/graph.py`), built from `data/careers.py`.
- Recommendation engine (`services/recommendation_engine.py`) uses **direct
  dictionary lookups** to find candidate careers — NOT graph traversal.
- Weighted scoring (`services/scoring.py`): Skills 70% / Interests 20% /
  Academic Score 10%, with proportional weight redistribution (preserving the
  7:2 skill:interest ratio) when academic score is not provided.
- BFS/DFS (`services/graph_algorithms.py`) exist purely as a **separate
  demonstration/visualization feature** — confirmed via code inspection to
  have zero involvement in actual recommendation generation.
- Input validation (`services/validation.py`): typo detection via
  `difflib`, range/type checks, and a documented Session-5 contradictory-
  preference test case.
- A real backend hash-vs-sequential-search timing benchmark exists
  (`services/hashing_benchmark.py`, endpoint `GET /api/hashing/benchmark`) —
  measures actual Python `dict` vs `list` performance on a synthetic dataset,
  never touching real student data.
- Full API surface (`backend/app.py`): `/api/health`, `/api/validate` (POST),
  `/api/recommend` (POST), `/api/student/<id>` (GET), `/api/careers` (GET),
  `/api/graph/bfs/<node>` (GET), `/api/graph/dfs/<node>` (GET),
  `/api/hashing/benchmark` (GET).

**Frontend (React + Vite):**
- React 19.2.8 / react-dom 19.2.8, Vite 8.2.2, `@vitejs/plugin-react` 6.1.0
  (confirmed from `frontend/package.json` this session).
- **No UI framework, no icon library, no animation library, no chart
  library** — confirmed by reading `package.json` directly. Every icon in the
  app is a hand-written inline SVG. Every animation so far is plain CSS
  (`transition`/`@keyframes`).
- **No `react-router`** — navigation is a hand-rolled `useState` + object-map
  page switcher in `App.jsx`. No URL changes, no deep-linking. This has been
  deliberately preserved through every redesign stage.
- 8 pages, all with genuine, previously-verified working functionality (not
  placeholders): Home, Recommendation, Student Lookup, Career Explorer,
  Career Comparison, Graph Algorithms ("Graph Lab" in nav), System Testing,
  System Insights (file: `GapAnalysis.jsx`).
- `frontend/src/services/api.js` is the single file that talks to the
  backend (base URL hardcoded to `http://127.0.0.1:5000/api`). It has not
  been touched during the entire visual redesign (Stages 1–4).

---

## 2. CURRENT PROJECT STATE

The project has gone through a full visual redesign, in stages, from an
original "premium dark academic" theme, through a **rejected**
"Glassmorphic AI Command Terminal" direction, to the current, approved
direction: a **premium editorial/cinematic dark website** with a violet/
magenta/lavender palette, inspired by reference images the user supplied
(not copied literally).

Completed and approved stages, in order:
- **Redesign Stage 1:** New dark token foundation in `index.css` (near-black
  `#050507` background, violet/magenta/lavender palette, Playfair Display
  headings, Inter body text), plus global button foundation (gradient
  primary button, ghost secondary button).
- **Redesign Stage 2:** Old sidebar/dashboard/"SYSTEM ONLINE" HUD shell
  removed entirely; replaced with a minimal top navigation bar
  (`.site-header`/`.site-nav`) in `Navbar.jsx` and a simplified `App.jsx`.
- **Redesign Stage 3:** Shared component visual pass (cards, results
  sections, message boxes, tags, tables, `.score-details`) — restyled to
  feel editorial rather than dashboard-widget-like, still card-based, no
  page JSX rewritten. `Home.jsx` was explicitly excluded from this pass.
- **Redesign Stage 4 (Home page), broken into sub-stages:**
  - **Stage 4A** — read-only inspection only. Established that no reusable
    liquids/wave asset existed (`assets/hero.png` was confirmed, by opening
    it directly, to be an unrelated generic 3D isometric card graphic, and
    confirmed unused). Concluded an inline SVG approach (not an image) was
    the right technique, and proposed a hero-scoped liquid background.
  - **Stage 4B** — implemented a **static** SVG liquid effect scoped to
    `.home-hero` only. **Important note preserved from that stage:** the
    first attempt rendered far too intense (looked like a solid purple box)
    — this was caught by actually launching the dev server and screenshotting
    it with Playwright (not by code review alone), then corrected through
    two rounds of opacity/shape reduction until verified acceptable.
  - **Stage 4C — COMPLETE AND VERIFIED.** Extended the liquid background
    from hero-only to the **entire Home page** (hero + feature card grid),
    reworked into a left-edge/right-edge/lower-page multi-form composition,
    made it reach true viewport edges via a full-bleed CSS technique, and
    made the feature cards very slightly translucent so the atmosphere
    shows around/behind them. Verified via real browser screenshots at
    desktop/tablet/mobile and a programmatic overflow check. **This is the
    last completed piece of work.**

**As of this handoff, Stage 4C is finished, verified, and no further
implementation has been started.** No commit or push has been made for any
stage — all work is currently uncommitted in the working tree (confirmed via
`git status` at the end of Stage 4C).

---

## 3. STAGE 4C IMPLEMENTATION DETAILS

**Files changed in Stage 4C (verified via `git diff` — these are the only
two files touched in this stage):**
- `frontend/src/pages/Home.jsx`
- `frontend/src/App.css`

No other file (including `index.css`, `Navbar.jsx`, `App.jsx`, any other
page, `services/api.js`, backend files, `package.json`) was modified in
Stage 4C — explicitly confirmed via `git diff --stat` against each of those
paths returning no output for this stage's changes.

### `Home.jsx` — `HomeLiquidBackground` component

- **Placement:** Renders as the **first child of `<section className="home">`**
  (a sibling of `.home-hero` and `.home-features`) — moved here from Stage
  4B, where it was the first child of `.home-hero` only (which is why it
  previously covered only the hero).
- **SVG:** `viewBox="0 0 1440 1000"`, `preserveAspectRatio="xMidYMid slice"`.
- **Composition (4 layers, not one shape):**
  1. **Left-edge organic path** (`.home-liquid-mass-left`) — hugs the left
     viewBox edge, asymmetric bezier curve, full page height, filled with
     `url(#liquidLeftGradient)` (linear gradient `#7c3aed`→`#c026d3`, low
     opacity — final tuned values: `stopOpacity="0.20"` → `"0.08"`), blurred
     via `url(#liquidBlurSoft)` (`feGaussianBlur stdDeviation="16"`).
  2. **Right-edge organic path** (`.home-liquid-mass-right`) — a
     **deliberately different silhouette**, not a mirror of the left form,
     filled with `url(#liquidRightGradient)` (`#8b5cf6`→`#c4b5fd`,
     `stopOpacity="0.17"` → `"0.06"`), same blur filter.
  3. **Lower-page pool** (`.home-liquid-mass-lower`) — a wide, low, subtle
     shape entering from both edges, positioned behind where the feature
     card grid sits, flat fill `#7c3aed` at `opacity="0.07"`.
  4. **Three soft highlight ellipses** (`.home-liquid-highlight`) — very low
     opacity (`0.05`–`0.07`), heavily blurred (`url(#liquidBlurHeavy)`,
     `feGaussianBlur stdDeviation="40"`), positioned toward the sides and
     lower-mid area, deliberately kept away from directly behind the `<h1>`.
- **Colors are hardcoded hex values** matching `index.css` tokens exactly
  (`--primary: #8b5cf6`, `--primary-dark: #7c3aed`, `--secondary: #d946ef`,
  `--secondary-dark: #c026d3`, `--accent: #c4b5fd`) — SVG `<stop>` elements
  cannot reliably consume CSS custom properties, so exact hex values are used
  instead and must be kept in sync manually if the tokens ever change.
- **Fully static** — no `<animate>`, no CSS `@keyframes`/`transition` applied
  to any liquid element, no JS-driven motion. This was an explicit
  requirement of Stages 4B/4C.
- `aria-hidden="true"` on the outer wrapper; no meaningful text inside the SVG.

### `App.css` — layout/positioning changes

- **`.home`** — given `position: relative;` (it did **not** previously have
  this). Deliberately has **no `overflow: hidden`** of its own.
- **`.home-liquid-bg`** (the wrapper div around the SVG + scrim) — the
  **full-bleed 100vw technique**:
  ```css
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  ```
  This breaks the decorative layer out of `.page-container`'s
  `max-width: 960px` constraint so it visually reaches the true viewport
  edges, not just 130% of the narrower content column (which is what Stage
  4B originally did, scoped to the hero).
- **Why no horizontal scroll despite `100vw` and no `overflow:hidden` on
  `.home`:** the project's **pre-existing global rule** `body { overflow-x:
  hidden; }` in `index.css` (confirmed present, unchanged, at line ~114 of
  that file) is the actual safety net. This is a deliberate reliance on
  already-existing infrastructure, not a new addition.
- **`.home-liquid-scrim`** — changed from Stage 4B's bottom-anchored linear
  fade to a **centered radial vignette**:
  ```css
  background: radial-gradient(
    ellipse 60% 55% at 50% 32%,
    var(--bg) 0%,
    rgba(5, 5, 7, 0.7) 45%,
    transparent 80%
  );
  ```
  This keeps the central column (behind the heading, description, and card
  grid) predominantly dark, while fading out before reaching the left/right
  liquid forms so they stay visible near the edges.
- **`.home-hero, .home-features`** — both simply given
  `position: relative; z-index: 1;` as whole blocks (simpler than Stage 4B's
  per-child `:not()` selector, since the background is no longer nested
  inside `.home-hero`).
- **`.home-feature-card`** — background changed from the fully opaque
  `var(--surface)` to **`rgba(15, 12, 22, 0.92)`** (same RGB as `--surface`,
  8% translucent). This was the "minimum necessary adjustment" identified so
  the atmosphere can faintly show around/through the cards — explicitly
  **not** glassmorphism (no `backdrop-filter`/blur was added to the cards).

### Responsive behavior
No new media queries were added for the liquid background itself — the
`100vw`/`slice`-fit/percentage-based approach scales continuously across all
widths without breakpoint-specific rules. Existing `.home-features` grid
breakpoints (unrelated to this stage) were not touched.

---

## 4. VERIFICATION RESULTS

All verification below was performed by actually launching the Vite dev
server and driving a real headless Chromium browser via Playwright (invoked
through `npx`, not installed as a project dependency) — not by code review
alone. `npx playwright install chromium --with-deps` was run once to fetch
the browser binary for this session's verification only.

- **`npm run build`:** succeeded on the final version — 27 modules
  transformed, no errors. (Also succeeded on two earlier intermediate
  attempts during iteration — see "failed verification attempts" below.)
- **CSS brace balance check** (`{` count vs `}` count in `App.css`): balanced
  (299/299) on the final version.
- **Desktop (1440×900 / 1440×1200 full-page):** Screenshot confirmed side
  violet glows genuinely reaching the viewport edges, a dark, readable
  center column, atmosphere visible in the margins and gaps around the
  2-row/3-column feature card grid, no visible rectangular SVG boundary.
- **Tablet (768×1024):** Screenshot confirmed correct scaling, 2-column card
  layout, no overflow, hero and cards fully readable.
- **Mobile (375×812/1600 full-page):** Screenshot confirmed single-column
  card stack, subtle violet visible at the edges, fully readable, no
  overflow.
- **Overflow check at 1440, 768, 375, and 320px** — done **programmatically**
  (not just visually), via `document.documentElement.scrollWidth` vs
  `clientWidth` in real Chromium:
  ```
  viewport=1440px scrollWidth=1440 clientWidth=1440 overflow=false
  viewport=768px  scrollWidth=768  clientWidth=768  overflow=false
  viewport=375px  scrollWidth=375  clientWidth=375  overflow=false
  viewport=320px  scrollWidth=320  clientWidth=320  overflow=false
  ```
  Confirmed **zero horizontal overflow** at every tested width, including
  the narrowest common phone width (320px), which was not explicitly
  requested but was checked as an extra safety margin.

### Failed verification attempts and how they were resolved
1. **First Stage 4B attempt (hero-only, prior stage):** rendered as a
   near-solid purple box filling the whole hero — caught via screenshot, fixed
   by reducing opacities by roughly two-thirds and shrinking the shapes'
   vertical footprint. This is documented here because the same lesson
   (start conservative, verify visually, adjust) directly informed Stage 4C's
   final opacity values, which were carried forward already-tuned rather than
   re-derived from scratch.
2. **Stage 4C, first full-page composition attempt:** the initial full-page
   version was visually inspected and iterated on directly (not a hard
   failure like the Stage 4B case, but adjusted before being accepted) —
   the version described in Section 3 above is the one actually verified and
   left in place.
3. **Tooling friction (not a design issue):** `chromium-cli` (the tool
   normally preferred for this kind of verification per this project's `run`
   skill guidance) was not available in this environment. Fallback: `npx
   playwright` was used directly instead, including one dead end where
   `import { chromium } from 'playwright'` failed under plain `node` due to
   module resolution (the package was only present in `npx`'s isolated
   cache, not the project's `node_modules`) — resolved by explicitly setting
   `NODE_PATH` to the npx cache directory for the one-off verification
   script. **`playwright` was never added to `package.json`** — it was
   fetched transiently via `npx` each time and is not a project dependency.

---

## 5. IMPORTANT CONSTRAINTS (carry forward into all future stages)

- Do not change backend functionality, API contracts, recommendation logic,
  scoring logic, hashing logic, BFS/DFS logic, or validation logic.
- Do not modify `frontend/src/services/api.js`.
- Do not add Google Sign-In, authentication, student accounts, student
  profiles/login, or any dashboard concept — none of this exists and none
  should be added unless the user explicitly asks.
- Do not introduce `react-router` or any new npm dependency without explicit
  approval; `package.json` has not been modified through any redesign stage
  so far and this should continue.
- Preserve existing navigation mechanism (`useState`-based page switching in
  `App.jsx`, `onNavigate(id)` prop drilling) and all 8 existing routes/page
  ids (`home`, `recommendation`, `lookup`, `careers`, `compare`, `graph`,
  `testing`, `gapanalysis`).
- Visual target: the violet/magenta/lavender "premium editorial/cinematic"
  liquid atmosphere direction, inspired by (not copied from) reference
  images — confirmed by the user across Stages 1–4.
- **The user has stated the background should "eventually feel animated,
  subtle and professional"** — this is a forward-looking intent for a later
  stage, not yet implemented. Everything built through Stage 4C is
  explicitly **static** — this was a hard requirement of Stages 4B and 4C
  ("Do NOT animate yet").
- Text and cards must remain clearly readable at all times — this has been
  verified, not just assumed, at every stage via real screenshots.
- Avoid a glassmorphism redesign — the Stage 3 direction deliberately moved
  *away* from "everything is frosted glass"; the Stage 4C card translucency
  (0.92 alpha, no blur) was a deliberate minimal exception, not a reversal of
  that principle.

---

## 6. NEXT STAGE — Stage 4D (investigation only, NOT implemented)

Stage 4D has **not been started**. Based on the user's stated intent, it
should investigate (read-only, no code changes) the following before any
animation is implemented:

1. **Confirm current state is static.** (This handoff already confirms it
   is — no `@keyframes`, no CSS `transition` on any `.home-liquid-*` element,
   no `<animate>`/`<animateTransform>` in the SVG, no JS motion. This should
   still be independently re-verified at the start of 4D by reading the
   actual files, not assumed from this document alone.)
2. **Determine the safest way to introduce subtle motion**, considering:
   - The project's existing global `@media (prefers-reduced-motion: reduce)`
     rule in `index.css` (already present and used by every other animation
     in the app — e.g. button-press transforms, card hover lifts,
     `.results-section`/`.score-details-body` fade-in) — any new motion must
     respect this existing mechanism, not create a second one.
   - Performance: the liquid SVG has multiple blurred, filtered shapes;
     animating filter/blur properties directly can be expensive, whereas
     animating `transform` (translate/rotate on the whole shape or gradient
     stops) is typically cheaper.
3. **Compare approaches explicitly, on their merits, before choosing one:**
   - **CSS-only animation** (`@keyframes` on `transform`/gradient position of
     the existing SVG elements via CSS, since they already have class names) —
     likely the lowest-risk, most consistent-with-project-conventions option
     (the whole app's motion so far is CSS-only).
   - **SVG-native animation** (`<animate>`/`<animateTransform>`,
     `<animateMotion>` on the path/gradient elements) — works without any CSS
     changes but is a different authoring model than the rest of the project
     uses.
   - **Any other frontend-only approach** the investigation turns up —
     explicitly stay within "no new dependency" (no Framer Motion, no GSAP,
     no canvas — canvas was explicitly ruled out for 4C already) unless the
     user is asked and agrees to add one.
4. Stage 4D should end with a recommendation and a plan, **not** an
   implementation — consistent with how Stage 4A (investigation) preceded
   Stage 4B (implementation) earlier in this same Home-page work.

---

## 7. EXACT CURRENT FILES (roles, as of this handoff)

- **`frontend/src/pages/Home.jsx`** — Landing page. Contains the `FEATURE_ICONS`
  map, `FEATURES` array (6 feature cards, real descriptions matching actual
  functionality), the `HomeLiquidBackground` component (Stage 4C's full-page
  static liquid SVG, detailed in Section 3), and the `Home` component itself
  (hero block + feature card grid). Last modified: Stage 4C.
- **`frontend/src/App.css`** — The single shared stylesheet for the entire
  app (~1,900+ lines). Contains every shared component style (buttons, cards,
  forms, tables, message boxes, etc. from Stages 1–3) plus all Home-specific
  rules (`.home`, `.home-hero`, `.home-liquid-*`, `.home-features`,
  `.home-feature-card`, etc.). Last modified: Stage 4C (Home-specific rules
  only in that stage; other sections carry earlier stages' work).
- **`frontend/src/index.css`** — Global design tokens (colors, fonts,
  radii, shadows, gradients, spacing, transitions) and base element resets.
  Defines `--bg`, `--surface`, `--primary`/`--primary-dark`,
  `--secondary`/`--secondary-dark`, `--accent`, `--success`/`--warning`/
  `--danger`, `--gradient-primary`, `--gradient-atmosphere`, `--radius-*`,
  `--font-heading` (Playfair Display), `--font-body` (Inter), `--font-mono`
  (JetBrains Mono, defined but not yet used inside any page), and the global
  `body { overflow-x: hidden; }` rule and `prefers-reduced-motion` handling
  that Stage 4C explicitly relies on. **Not modified in Stage 4C.**
- **`frontend/src/App.jsx`** — App shell/router. Holds the `PAGES` id→component
  map and `useState('home')` for current page; renders `<Navbar>` then
  `<main className="page-container"><CurrentPageComponent /></main>`.
  **Not modified in Stage 4C** (last changed in redesign Stage 2, when the
  old sidebar/topbar/status-indicator shell was removed).
- **`frontend/src/components/Navbar.jsx`** — Minimal top navigation
  (`.site-header`/`.site-brand`/`.site-nav`/`.site-nav-link`), replacing the
  earlier rejected sidebar. Renders `NAV_LINKS` (8 items: Home,
  Recommendation, Student Lookup, Career Explorer, Compare, Graph Lab,
  System Testing, Insights) and a mobile menu toggle + stacked mobile nav.
  **Not modified in Stage 4C** (last changed in redesign Stage 2).

---

## 8. UNCERTAINTY / NOT INDEPENDENTLY RE-VERIFIED AT HANDOFF TIME

To be explicit about what this document does and does not guarantee:

- The exact current byte-for-byte contents of `Home.jsx` and `App.css` were
  not re-read a second time purely for this handoff (they were read and
  edited directly during Stage 4C in this same session, and the build/
  screenshot verification in Section 4 ran against those exact files) — so
  this document reflects the state as last verified, not a fresh re-read
  performed only for this handoff.
- Whether `git status` still shows exactly the same set of modified files at
  the moment this handoff is read (vs. when Stage 4C finished) is not
  guaranteed if anything else touched the repo in the meantime outside this
  conversation — this has happened at least once before in this project's
  history (an external commit was discovered mid-session in an earlier
  stage). **Recommend running `git status`/`git diff --stat` again at the
  start of Stage 4D before trusting file-state claims in this document.**
- No commit has been made for Stage 1 through Stage 4C's work as of this
  handoff — everything is uncommitted in the working tree, based on the last
  `git status` run during this session.
