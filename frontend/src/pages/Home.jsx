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

function Home({ onNavigate }) {
  return (
    <section className="home">
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
