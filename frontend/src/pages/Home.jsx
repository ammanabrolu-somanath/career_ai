// Local icon set matching the Navbar's visual language, kept lightweight
// (plain inline SVG, no dependency) and self-contained to this page.
const FEATURE_ICONS = {
  recommendation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  lookup: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20.5" y1="20.5" x2="15.3" y2="15.3" />
    </svg>
  ),
  careers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="14.5 9.5 10.5 10.5 9.5 14.5 13.5 13.5" />
    </svg>
  ),
  compare: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="7" height="14" rx="1" />
      <rect x="13" y="5" width="7" height="14" rx="1" />
    </svg>
  ),
  graph: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.1" />
      <circle cx="18" cy="6" r="2.1" />
      <circle cx="12" cy="18" r="2.1" />
      <line x1="7.7" y1="7.3" x2="10.5" y2="16" />
      <line x1="16.3" y1="7.3" x2="13.5" y2="16" />
      <line x1="8.2" y1="6" x2="15.8" y2="6" />
    </svg>
  ),
  testing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </svg>
  ),
}

// Descriptions reflect only functionality that actually exists in the app.
const FEATURES = [
  {
    id: 'recommendation',
    title: 'Career Recommendation',
    description: 'Get ranked career matches based on your skills, interests, and academic score.',
  },
  {
    id: 'lookup',
    title: 'Student Lookup',
    description: 'Retrieve a stored student profile instantly using hash-based lookup.',
  },
  {
    id: 'careers',
    title: 'Career Explorer',
    description: 'Browse every available career and see exactly which skills each one requires.',
  },
  {
    id: 'compare',
    title: 'Career Comparison',
    description: 'Compare any two careers side by side — skills, interests, and descriptions.',
  },
  {
    id: 'graph',
    title: 'Graph Algorithms',
    description: 'Watch BFS and DFS traverse the career graph, step by step, for demonstration.',
  },
  {
    id: 'testing',
    title: 'System Testing',
    description: 'Run live checks against the backend and view a pass/fail summary.',
  },
]

// Purely decorative cinematic backdrop for the entire Home page (hero +
// feature cards). Stage 5A: reworked into a layered wave structure per
// side - a broad, very soft dark-violet BASE mass, a more elongated,
// multi-undulation "wave ribbon" on top of it (this is the piece that
// carries Stage 4E's existing drift animation, unchanged), and a thin
// soft luminous edge accent tracing part of the ribbon's contour - plus
// the existing, still-static, atmospheric highlight glows repositioned
// to sit near those edges instead of floating independently. The lower
// band (.home-liquid-mass-lower) is intentionally left geometrically
// unchanged from Stage 4C/4E, since it sits closest to the feature cards
// and this stage is scoped to the left/right wave structure only.
// Hex values match index.css's --primary/--primary-dark/--secondary/
// --secondary-dark/--accent tokens exactly (SVG <stop> can't reliably
// consume CSS custom properties). Still static except for the existing
// Stage 4E transform animation on .home-liquid-mass-left/-right.
function HomeLiquidBackground() {
  return (
    <div className="home-liquid-bg" aria-hidden="true">
      <svg
        className="home-liquid-svg"
        viewBox="0 0 1440 1560"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="liquidBaseLeftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c026d3" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id="liquidBaseRightGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="liquidLeftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#c026d3" stopOpacity="0.09" />
          </linearGradient>
          <linearGradient id="liquidRightGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.19" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.08" />
          </linearGradient>
          <filter id="liquidBlurSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id="liquidBlurHeavy" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <filter id="liquidBlurThin" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Stage 5B correction: the whole composition is wrapped in a
            vertical-only scale so it can cover a much taller area (the
            hero now fills the viewport, see App.css) without hand-
            redrawing every path - the original artwork (authored for a
            0-1010-tall space) is stretched to fill the new 0-1560-tall
            viewBox. Scale is vertical-only (x stays 1) so horizontal
            wave placement/spacing near the edges is unaffected. */}
        <g transform="scale(1, 1.545)">
          {/* 1a. Left base mass - broad, very soft, low-opacity dark-violet
              ambient field behind the left wave ribbon. */}
          <path
            className="home-liquid-base-left"
            d="M-60,-60 C260,60 120,320 300,520 C450,680 200,820 280,1060 L-60,1060 Z"
            fill="url(#liquidBaseLeftGradient)"
            filter="url(#liquidBlurHeavy)"
          />

          {/* 1b. Left wave ribbon - a longer, multi-undulation band (two
              wavy boundaries, not one blob edge) so it reads as a flowing
              wave rather than a pool. Keeps the .home-liquid-mass-left
              class so Stage 4E's existing drift animation still applies,
              unchanged. */}
          <path
            className="home-liquid-mass-left"
            d="M-20,-20 C220,10 60,160 240,240 C400,310 120,420 280,500 C420,570 140,660 300,740 C420,800 160,880 240,1020 L100,1020 C40,900 220,820 60,740 C-60,660 180,560 40,480 C-80,400 160,320 20,240 C-80,160 140,80 -20,-20 Z"
            fill="url(#liquidLeftGradient)"
            filter="url(#liquidBlurSoft)"
          />

          {/* 1c. Left luminous edge - a thin, brighter stroke tracing part
              of the wave ribbon's outer contour. Minimal blur so it stays
              crisp enough to read as an edge, not just more fog. */}
          <path
            className="home-liquid-edge-left"
            d="M40,80 C220,140 100,260 260,340 C400,410 160,500 280,580"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.26"
            filter="url(#liquidBlurThin)"
          />

          {/* 1d-1f. Additional thin contour strokes layered over the left
              ribbon - the reference composition reads as several
              overlapping silk-like lines with real depth, not one edge, so
              three more crisp low-opacity strokes are added here at
              different curvatures/vertical bands and alternating
              violet/magenta/lavender tones, purely additive (the existing
              base/mass/edge paths above are unchanged). */}
          <path
            d="M-40,20 C260,-30 380,120 220,180 C100,220 280,80 460,40"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.20"
            filter="url(#liquidBlurThin)"
          />
          <path
            d="M-40,260 C160,200 280,300 220,380 C180,430 80,410 60,350 C40,300 140,340 260,420 C380,500 540,460 640,400"
            fill="none"
            stroke="#d946ef"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.18"
            filter="url(#liquidBlurThin)"
          />
          <path
            d="M-40,420 C220,480 160,560 380,540 C540,525 460,600 640,580"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.15"
            filter="url(#liquidBlurThin)"
          />

          {/* 2a. Right base mass - broad, very soft, low-opacity field
              behind the right wave ribbon. */}
          <path
            className="home-liquid-base-right"
            d="M1500,-60 C1180,60 1320,320 1140,520 C990,680 1240,820 1160,1060 L1500,1060 Z"
            fill="url(#liquidBaseRightGradient)"
            filter="url(#liquidBlurHeavy)"
          />

          {/* 2b. Right wave ribbon - a different rhythm from the left one
              (not mirrored). Keeps .home-liquid-mass-right so Stage 4E's
              drift animation still applies, unchanged. */}
          <path
            className="home-liquid-mass-right"
            d="M1460,-30 C1220,20 1340,150 1180,230 C1040,300 1300,400 1160,480 C1030,550 1290,650 1150,730 C1030,800 1280,870 1200,1010 L1340,1010 C1400,900 1240,820 1380,740 C1480,660 1300,560 1420,480 C1500,400 1320,320 1440,240 C1500,160 1340,80 1460,-30 Z"
            fill="url(#liquidRightGradient)"
            filter="url(#liquidBlurSoft)"
          />

          {/* 2c. Right luminous edge - thin, brighter stroke, different
              contour from the left edge. */}
          <path
            className="home-liquid-edge-right"
            d="M1400,100 C1220,155 1340,270 1190,350 C1060,420 1290,505 1170,585"
            fill="none"
            stroke="#d946ef"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.22"
            filter="url(#liquidBlurThin)"
          />

          {/* 2d-2f. Additional thin contour strokes layered over the right
              ribbon, mirroring the left side's added depth (1d-1f) with
              the same alternating tones. */}
          <path
            d="M1480,20 C1180,-30 1060,120 1220,180 C1340,220 1160,80 980,40"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.20"
            filter="url(#liquidBlurThin)"
          />
          <path
            d="M1480,260 C1280,200 1160,300 1220,380 C1260,430 1360,410 1380,350 C1400,300 1300,340 1180,420 C1060,500 900,460 800,400"
            fill="none"
            stroke="#d946ef"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.18"
            filter="url(#liquidBlurThin)"
          />
          <path
            d="M1480,420 C1220,480 1280,560 1060,540 C900,525 980,600 800,580"
            fill="none"
            stroke="#c4b5fd"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.15"
            filter="url(#liquidBlurThin)"
          />

          {/* 3. Lower-page form - geometrically unchanged from Stage
              4C/4E, just carried along by the same wrapper scale. */}
          <path
            className="home-liquid-mass-lower"
            d="M-10,720 C220,660 420,770 700,715 C960,665 1160,765 1450,690 L1450,1010 L-10,1010 Z"
            fill="#7c3aed"
            opacity="0.10"
            filter="url(#liquidBlurSoft)"
          />

          {/* 4. Soft atmospheric highlights - still static, repositioned
              near the luminous edges, brightened slightly alongside the
              rest of the composition. */}
          <ellipse
            className="home-liquid-highlight"
            cx="250"
            cy="330"
            rx="170"
            ry="200"
            fill="#c4b5fd"
            opacity="0.11"
            filter="url(#liquidBlurHeavy)"
          />
          <ellipse
            className="home-liquid-highlight"
            cx="1200"
            cy="380"
            rx="160"
            ry="190"
            fill="#d946ef"
            opacity="0.09"
            filter="url(#liquidBlurHeavy)"
          />
          <ellipse
            className="home-liquid-highlight"
            cx="720"
            cy="900"
            rx="280"
            ry="100"
            fill="#c4b5fd"
            opacity="0.08"
            filter="url(#liquidBlurHeavy)"
          />
        </g>
      </svg>
      <div className="home-liquid-scrim" />
    </div>
  )
}

function Home({ onNavigate }) {
  return (
    <section className="home">
      <HomeLiquidBackground />

      <div className="home-hero">
        <span className="stat-pill stat-primary">AI-Based Smart Career Guidance System</span>
        <h1>Find the career path that fits your skills and interests</h1>
        <p className="home-description">
          This system recommends suitable career paths based on your skills, interests, and
          academic performance. It uses a rule-based, graph-driven recommendation engine —
          built on Python dictionaries, direct graph lookups, and a weighted scoring formula —
          to rank careers by how well they match your profile, without relying on machine
          learning.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={() => onNavigate('recommendation')}
        >
          Get Career Recommendations
        </button>
      </div>

      <div className="home-features">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            type="button"
            className="home-feature-card"
            onClick={() => onNavigate(feature.id)}
          >
            <span className="home-feature-icon" aria-hidden="true">
              {FEATURE_ICONS[feature.id]}
            </span>
            <h3 className="home-feature-title">{feature.title}</h3>
            <p className="home-feature-description">{feature.description}</p>
            <span className="home-feature-cta">
              Open <span className="home-feature-arrow">→</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default Home
