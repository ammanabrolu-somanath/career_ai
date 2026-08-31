# PROJECT_CONTEXT.md

**Purpose of this file:** This is a context-handoff document for a future Claude session working on this project. It records the complete, accurate current state of the AI-Based Smart Career Guidance System as of the end of the most recent work session (the Graph Algorithms visualization redesign). Read this file completely before making any changes.

---

## 1. Project Overview

**Name:** AI-Based Smart Career Guidance System

**Purpose:** A full-stack web application that recommends career paths to a student based on their skills, interests, and academic score. It is explicitly **rule-based and deterministic** — no machine learning or deep learning is used anywhere. Every recommendation is traceable to a specific calculation on real data.

**Architecture:**

```
React Frontend (Vite, :5173)
        |  fetch() over HTTP/JSON
API Service Layer (frontend/src/services/api.js)
        |  HTTP requests to http://127.0.0.1:5000/api/*
Flask Backend (backend/app.py, :5000)
        |  function calls (in-process)
Career Data / Algorithms (backend/data/, backend/services/)
```

The frontend contains no recommendation logic itself — it only sends JSON requests and renders whatever JSON comes back.

**Technology stack:**
- Backend: Python, Flask, Flask-CORS. No database (all data lives in-memory in Python dicts/lists). No ORM.
- Frontend: React (function components + hooks only), Vite, plain JavaScript (no TypeScript), plain CSS (no Tailwind/Bootstrap/CSS-in-JS). No external UI or visualization libraries have been installed at any point in this project.
- Dev servers: Flask on `http://127.0.0.1:5000`, Vite on `http://localhost:5173`.

---

## 2. Important Project Structure

```
career guiding ai/
├── backend/
│   ├── venv/                          Python virtual environment (gitignored)
│   ├── requirements.txt               Flask, Flask-Cors
│   ├── app.py                         Flask app + ALL API routes
│   ├── data/
│   │   ├── careers.py                 Source of truth: CAREERS list (12 careers)
│   │   ├── graph.py                   SKILL_TO_CAREERS / INTEREST_TO_CAREERS (directed, primary graph)
│   │   └── student_profiles.py        STUDENTS dict (5 sample profiles), hash lookup
│   └── services/
│       ├── validation.py              validate_profile() — Session 5 failure-case handling
│       ├── scoring.py                 Weighted score calculation (skill/interest/academic)
│       ├── recommendation_engine.py   recommend_careers() — orchestrates the full pipeline
│       └── graph_algorithms.py        BFS/DFS — DEMONSTRATION ONLY, isolated from recommendations
│
└── frontend/
    ├── src/
    │   ├── App.jsx                    PAGES routing map + top-level layout (hand-rolled router)
    │   ├── App.css                    All page-specific + shared component CSS
    │   ├── index.css                  Design tokens (CSS custom properties), global resets, type scale
    │   ├── main.jsx                   React entry point
    │   ├── components/
    │   │   └── Navbar.jsx             Icons, CORE_LINKS/DEMO_LINKS grouping
    │   ├── services/
    │   │   └── api.js                 THE ONLY file that calls fetch() — every page imports from here
    │   └── pages/
    │       ├── Home.jsx                Hero + feature-preview cards (all real functionality, no invented features)
    │       ├── Recommendation.jsx      Profile form -> ranked recommendation cards
    │       ├── StudentLookup.jsx       Student ID search -> profile card
    │       ├── GraphAlgorithms.jsx     BFS/DFS demo + NEW lane-based graph visualization (see Section 6)
    │       ├── CareerExplorer.jsx      Browse/search all careers, chip-based skill/interest display
    │       ├── CareerComparison.jsx    Side-by-side comparison of 2 careers, shared-tag highlighting
    │       └── SystemTesting.jsx       Runs 6 live tests against the real backend, pass/fail dashboard
    └── package.json / vite.config.js / index.html
```

---

## 3. Career Recommendation System

Full pipeline (`services/recommendation_engine.py`, `recommend_careers(profile)`):

1. **Validation** (`services/validation.py`, `validate_profile()`) — checks required fields exist, skills/interests are recognized (case-insensitive against `data/careers.py`'s `ALL_SKILLS`/`ALL_INTERESTS`), academic_score (if given) is 0-100. Unrecognized skills/interests get a `difflib`-based spelling suggestion (e.g. "Pyhton" -> "Python") but are **never auto-corrected** — the user is only informed. Returns `{valid, errors, warnings, suggestions, contradictory_preferences, normalized_profile}`. If invalid, `recommend_careers()` returns immediately with `success:false` and no further processing.
2. **Candidate career discovery** (`data/graph.py`, `get_candidate_careers(skills, interests)`) — a **direct dictionary lookup** (`SKILL_TO_CAREERS[skill]` / `INTEREST_TO_CAREERS[interest]`), unioned across all the student's skills/interests. This is O(1) average time per lookup. **This is the only mechanism used to find candidate careers — BFS/DFS are never called here.**
3. **Scoring** (`services/scoring.py`, `score_career()`) — for each candidate career: Skill Score = matched/required skills fraction; Interest Score = matched/related interests fraction; Academic Component = academic_score/100 (or `None` if not provided).
4. **Weighted final score** — `Final Score = (Skill Score x 0.70) + (Interest Score x 0.20) + (Academic Component x 0.10)`. These weights (`SKILL_WEIGHT`, `INTEREST_WEIGHT`, `ACADEMIC_WEIGHT` in `scoring.py`) are an approved Implementation Decision, not something specified by any external requirement doc. **If academic_score is missing, it is NOT treated as 0** — the 10% weight is redistributed proportionally between skill (becomes ~77.8%) and interest (~22.2%), verified numerically to score higher than an explicit `academic_score: 0`.
5. **Ranking** — all candidates sorted by `final_score` descending, each assigned a 1-indexed `rank`.
6. **Explanation generation** — a plain-language sentence built per career from that career's own actual matched/missing skills/interests (never a hardcoded string).

**Backend response shape from `POST /api/recommend`:** `{success, errors, warnings, suggestions, contradictory_preferences, normalized_profile, recommendations: [{career_name, description, final_score, final_score_percentage, skill_score, skill_score_percentage, interest_score, interest_score_percentage, academic_component, weights_used, matched_skills, missing_skills, matched_interests, missing_interests, explanation, rank}]}`.

---

## 4. Graph Data Structure

There are **two distinct graphs** in the backend — this distinction is important and must not be confused:

1. **Primary recommendation graph** (`data/graph.py`):
   - `SKILL_TO_CAREERS`: dict, skill name -> list of career names.
   - `INTEREST_TO_CAREERS`: dict, interest name -> list of career names.
   - **Directed**, one hop deep only (skill/interest -> career; careers have no outgoing edges). Kept as two separate dicts (not merged) because a name like "Creativity" exists as both a skill and an interest in `careers.py` — merging would cause a collision.
   - Built automatically from `CAREERS` in `careers.py` at import time — never hand-duplicated.
   - **This is the graph the recommendation engine actually uses**, via direct dictionary lookup only.

2. **Demonstration traversal graph** (`services/graph_algorithms.py`, `DEMO_TRAVERSAL_GRAPH`):
   - A single dict, node name -> sorted list of neighbor names.
   - Built by taking every skill<->career and interest<->career edge from graph #1 and adding it **bidirectionally** (`add_edge()` sets both directions).
   - This is the graph BFS/DFS actually traverse. It is **structurally bipartite** — a node only ever connects to a node of the "other side" (skill/interest <-> career); there are no skill-skill, interest-interest, or career-career edges anywhere.
   - Exists only in backend memory — no endpoint exposes its raw edge list.

**BFS and DFS are purely educational/demonstration features.** They are implemented in a separate module that `recommendation_engine.py` never imports (verified via `grep` — zero references). They do not and must never drive the recommendation engine.

---

## 5. BFS and DFS API

**Endpoints:** `GET /api/graph/bfs/<node>` and `GET /api/graph/dfs/<node>` (Flask routes in `app.py`, calling `bfs_traversal()`/`dfs_traversal()` in `services/graph_algorithms.py`).

**Frontend functions** (`services/api.js`): `runBFS(node)` and `runDFS(node)`, both simple `GET` requests with `encodeURIComponent(node)`.

**Success response** (identical shape for both, only `algorithm` differs):
```json
{
  "success": true,
  "algorithm": "BFS",
  "start_node": "Python",
  "start_node_type": "skill",
  "traversal_order": ["Python", "AI Engineer", "..."],
  "visited_nodes": ["AI Engineer", "Algorithms", "..."],
  "discovered_careers": ["AI Engineer", "Cloud Engineer", "..."]
}
```
- `traversal_order`: full visit sequence in the order the algorithm actually visited nodes (flat list, no parent pointers).
- `visited_nodes`: same set, alphabetically sorted.
- `discovered_careers`: the subset of `traversal_order` that are career-type nodes, excluding the start node itself.
- `start_node_type`: `"skill"` | `"interest"` | `"career"` | `"unknown"`.

**Error response** (unknown node): `{"success": false, "error": "\"X\" was not found in the graph."}`, HTTP 404.

**Known dataset fact:** the demo dataset is small (12 careers, 18 skills, 7 interests, 37 nodes total) and densely connected — a BFS/DFS from almost any starting node visits nearly the entire graph (verified: ~35 of 37 nodes visited from "Python").

---

## 6. CURRENT Graph Algorithms Frontend (`frontend/src/pages/GraphAlgorithms.jsx`)

**Existing/unchanged functionality:**
- Text input for a start node (skill, interest, or career name), with a visually-hidden (`.sr-only`) `<label>` for accessibility.
- "Run BFS" and "Run DFS" buttons (`.secondary-button`), each independently tracked via a `runningAlgorithm` state so only the clicked button shows a spinner while loading.
- **Case normalization**: a `useEffect` on mount calls `getCareers()` and builds a `Map<lowercase, canonical-case>` so typing "python" still finds "Python" before the request is sent.
- **Node type classification**: the same `useEffect` also builds a `Map<name, "skill"|"interest"|"career">` (`nodeTypeMap`) from the same `getCareers()` response.
- Statistics: "Visited Nodes" and "Careers Discovered" counts, shown via the shared `.stat-row`/`.stat-block`/`.stat-value` components.
- "Discovered Careers" section: pill tags (`.skill-tag.skill-tag-neutral`) listing `result.discovered_careers`. **Unchanged by the redesign.**
- Static "Breadth-First Search (BFS)" / "Depth-First Search (DFS)" explanation cards at the bottom. **Unchanged.**
- Unknown-node and network-error states render via `.message-box.warning-box` / `.message-box.error-box`.

**NEW: the graph relationship visualization (replaces the old arrow-chain).**

The old implementation rendered `traversal_order` as a long horizontal/wrapped sequence: `Node ↓ Node ↓ Node ↓ ...`. This has been **completely removed** (the `.traversal-order` and `.traversal-arrow` CSS classes were also deleted as dead code) and replaced with a structural diagram:

- **Three lanes**: Skills | Interests | Careers, rendered side-by-side via a `<GraphDiagram>` component defined in the same file (plus helper subcomponents `<GraphLane>` and `<GraphNode>`).
- **Only visited nodes are shown** — nodes are filtered from `result.visited_nodes`, not the whole 37-node graph, keeping each lane compact.
- **Nodes are sorted by traversal order** within each lane (earliest-visited at top).
- **Every node has a 1-indexed traversal-order badge** (`.graph-node-order`, a small neutral pill showing e.g. "1", "2", "3" — computed via `orderIndexMap`, a `Map` built from `traversal_order.forEach((name, index) => map.set(name, index + 1))`).
- **Graph edges are reconstructed entirely client-side** from the already-fetched `getCareers()` response — the same `useEffect` mentioned above now also builds an `adjacency: Map<string, Set<string>>` via an `addEdge(adjacency, a, b)` helper that mirrors the backend's bidirectional derivation exactly: for every career, `addEdge(skill, career.name)` for each `required_skill`, and `addEdge(interest, career.name)` for each `related_interest`. **No new API call and no backend change were needed** — this is the same data the page was already fetching for case-normalization.
- **Only genuine edges between two visited nodes are drawn** — computed in a memoized `edgePairs` array: for every visited career node, look up its real adjacency neighbors, keep only those that are also visited and non-career, and record a `{from: skillOrInterest, to: career}` pair (deduplicated). This was verified programmatically against the live backend: every single drawn pair is confirmed to exist in the real adjacency map — nothing is invented.
- **No fake BFS/DFS parent tree is created.** The API's `traversal_order` has no parent pointers, and the redesign deliberately does not fabricate one — it shows the real, full adjacency among visited nodes instead, which is structurally honest (the graph is not a tree; a node can be adjacent to multiple already-visited nodes).
- **SVG connector lines**: an absolutely-positioned `<svg class="graph-diagram-lines">` sits behind the three lane columns (`z-index: 0` vs. lanes at `z-index: 1`), drawn with plain `<line>` elements, subtle styling (`stroke: var(--text-muted); stroke-opacity: 0.35`). Lines are `aria-hidden="true"` (decorative only — the underlying node/lane/order information is independently available as real text).
- **Positioning/measurement**: `useLayoutEffect` (keyed on `edgePairs`) measures each node's real `getBoundingClientRect()` via refs collected in a `useRef(new Map())` node-element registry, computes line coordinates relative to the diagram container, and stores them in state. A `ResizeObserver` (browser-native API, not a library) observes the container and re-measures whenever the layout changes (window resize, content reflow, orientation change). `useMemo` is used for `orderIndexMap`, `lanes`, and `edgePairs` to avoid recomputation on every render.
- **Mobile responsiveness**: at the existing `max-width: 640px` breakpoint (reused, not a new breakpoint value — this codebase already has multiple separate `@media (max-width: 640px)` blocks by convention), `.graph-diagram` switches to `flex-direction: column` (lanes stack: Skills, then Interests, then Careers) and `.graph-diagram-lines` gets `display: none`. The order badges remain fully visible in the stacked layout.
- **Node coloring**: reuses the exact existing `.traversal-step`, `.traversal-step-skill`, `.traversal-step-interest`, `.traversal-step-career` classes (already established site-wide: skill=primary/indigo, interest=success/teal, career=solid dark) — no new color palette was introduced.
- **Accessibility**: the diagram container has `role="group"` with a descriptive `aria-label` (e.g. "Graph relationships for the BFS traversal starting from Python. Each node shows its 1-indexed visit order."). All node names and order badges are real DOM text, independently readable by screen readers regardless of whether the (decorative, `aria-hidden`) connector lines are visible.
- A 4th "Other" lane exists as a defensive fallback (only rendered if non-empty) in case `nodeTypeMap` fails to classify a node (e.g. the background `getCareers()` fetch failed) — prevents silent data loss, matching the graceful-degradation pattern already used elsewhere on this page.

---

## 7. Recent Frontend Audit Improvements (Stage 7, Step 10 — completed BEFORE the graph redesign)

A full-frontend consistency audit was completed and the following genuine issues were found and fixed (only these — the audit explicitly avoided cosmetic changes without justification):

- **`.message-box` consistency**: `Recommendation.jsx` and `GraphAlgorithms.jsx` previously used bare `<p className="error-text">` for errors while every other redesigned page already used `.message-box.error-box`/`.warning-box`. Fixed to match.
- **Accessibility**: `GraphAlgorithms.jsx`'s node input had no associated `<label>` at all (placeholder-only). Fixed with a visually-hidden label using a new `.sr-only` utility class (standard clip-rect idiom) added to `App.css`.
- **Dead CSS removed** (confirmed zero remaining JSX references via `grep` before deletion): `.student-details`/`.student-details p`, `.career-tag-group`/`.career-tag-label`/`.career-tags`, `.test-summary`/`.test-summary-item`/`.test-summary-label`/`.test-summary-value`+modifiers, and (later, in the graph redesign itself) `.traversal-order`/`.traversal-arrow`. `.error-text` was also removed after both its remaining usages were converted to `.message-box`.
- **Duplicate CSS consolidated**: `.lookup-field`/`.search-field` were byte-identical rules, merged into one. The "label text" style (14px/600/text-color) was independently repeated across 4 selectors; consolidated into a shared selector list.
- **Responsive bug fixed**: `.comparison-row`'s tablet media query was `@media (min-width: 481px) and (max-width: 900px)`, declared *after* the mobile-stacking `@media (max-width: 640px)` rule in source order. At equal specificity, the later rule won — so between 481-640px, the comparison table incorrectly showed the cramped tablet layout instead of stacking. Fixed by narrowing the tablet band to `min-width: 641px`.
- All fixes were verified with a live script exercising every backend-touching operation (health, recommend success/error paths, student lookup found/not-found, careers, BFS/DFS success/unknown-node, validateProfile) against the real running Flask backend — all passed. `npm run build` succeeded; CSS bundle size measurably decreased (22.15 kB -> 21.29 kB) confirming the dead-code removal had real effect.

---

## 8. Latest Changes (Graph Algorithms Visualization Redesign)

The most recent implementation session modified **ONLY**:
- `frontend/src/pages/GraphAlgorithms.jsx`
- `frontend/src/App.css`

Confirmed via `git status --short` showing exactly these two files changed, and a backend file-timestamp check (`find backend/ -newer frontend/package.json`, excluding `venv/`/`__pycache__/`) returning zero results.

- **Backend was not modified** — `app.py`, `data/graph.py`, `data/careers.py`, `services/graph_algorithms.py` untouched.
- **`api.js` was not modified** — `runBFS`/`runDFS`/`getCareers` used exactly as they already existed; no new function added.
- **Recommendation functionality preserved** — untouched entirely; not part of this change's scope.
- **`npm run build`** succeeded: `✓ 26 modules transformed`, no compile errors.
- **Graph reconstruction tests passed**: a verification script reproduced the exact `addEdge`/`edgePairs`/lane-grouping logic and ran it against the live backend for all required scenarios — BFS from "Python", DFS from "Python" (confirmed genuinely different traversal order from BFS), an unknown node ("NotARealNodeXYZ", correctly `success:false`), a skill start ("Machine Learning"), an interest start ("Technology"), and a career start ("AI Engineer"). All passed, including a cross-check that every single drawn edge pair is a real entry in the reconstructed adjacency map (no invented relationships).

---

## 9. Current Git State

The project has its own git repository (separate from any parent/home-directory repo — this was deliberately set up this way; see repo history/commit log for details). Remote: `https://github.com/ammanabrolu-somanath/career_ai.git`, branch `main`.

**As of the end of the last work session, `git status` showed:**
```
 M frontend/src/App.css
 M frontend/src/pages/GraphAlgorithms.jsx
```
These changes (the graph visualization redesign) had **not yet been committed or pushed** at the time this context file was written. A future session should check current `git status` first — the user may have committed/pushed manually since, or these changes may still be pending.

---

## 10. Continuation Instructions

A future Claude session picking up this project must:

1. **Read this file (`PROJECT_CONTEXT.md`) completely first**, before reading any source code or taking any action.
2. **Inspect current versions of files before editing** — do not assume the state described here is still perfectly current; re-read the relevant files, especially if significant time/other sessions may have passed.
3. **Preserve all existing BFS/DFS functionality** — these are demonstration-only features (Section 4/5/6) and must remain fully working and visually distinct from the recommendation system.
4. **Preserve the recommendation system** (Section 3) — do not alter `recommendation_engine.py`, `scoring.py`, `validation.py`, or `data/graph.py`'s direct-lookup mechanism unless the user explicitly asks for a change to recommendation behavior.
5. **Avoid modifying backend files unless explicitly requested.** The established pattern throughout this project is frontend-only redesign work with the backend treated as a stable, tested contract.
6. **Do not overwrite or revert the graph visualization redesign** described in Section 6 — it is the current, intended state of `GraphAlgorithms.jsx`, not a draft to be replaced.
7. **Continue from the user's next instruction.** Do not assume further work is needed on any specific page — check what the user actually asks for next (e.g., committing/pushing the pending changes, further page redesigns, or something new entirely).

**General conventions observed throughout this project** (apply these when continuing):
- Never invent data, statistics, or scores not returned by the real backend — always verify against a live API response before displaying a new field.
- Reuse existing shared CSS classes/design tokens (`--primary`, `--success`, `--warning`, `--danger`, `--surface`, `--bg`, `--text`, `--text-muted`, `--border`, `--shadow-sm`/`--shadow-md`, `--radius-sm`/`--radius-md`/`--radius-lg`/`--radius-pill`, `--font-heading`) rather than introducing new colors or duplicate patterns.
- No external libraries have been added at any point (no Axios, no chart/graph visualization libraries, no UI frameworks) — this is a deliberate, consistently-enforced constraint.
- After any frontend change: verify both dev servers respond, test against the real backend (not mocks), run `npm run build`, delete any temporary verification scripts created during testing, and confirm via `find`/`git status` that the backend and unrelated files were not touched.
