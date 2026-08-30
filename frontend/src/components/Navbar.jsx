// Small inline stroke-icon set (no external icon library added - kept as
// simple SVG primitives so each icon is lightweight and inherits color via
// currentColor, matching hover/active states automatically).
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 11 12 4 20 11" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
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

// Same ids as before (App.jsx's PAGES map is untouched) - only reordered so
// the two purpose groups render as contiguous, visually separated clusters.
const CORE_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'recommendation', label: 'Career Recommendation' },
  { id: 'lookup', label: 'Student Lookup' },
  { id: 'careers', label: 'Careers' },
  { id: 'compare', label: 'Compare Careers' },
]

const DEMO_LINKS = [
  { id: 'graph', label: 'Graph Algorithms' },
  { id: 'testing', label: 'System Testing' },
]

function NavLink({ link, currentPage, onNavigate }) {
  return (
    <button
      type="button"
      className={`navbar-link${currentPage === link.id ? ' active' : ''}`}
      onClick={() => onNavigate(link.id)}
    >
      <span className="navbar-icon" aria-hidden="true">{ICONS[link.id]}</span>
      {link.label}
    </button>
  )
}

function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="navbar">
      <div className="navbar-title">AI-Based Smart Career Guidance System</div>
      <nav className="navbar-links">
        <div className="navbar-group">
          {CORE_LINKS.map((link) => (
            <NavLink key={link.id} link={link} currentPage={currentPage} onNavigate={onNavigate} />
          ))}
        </div>
        <span className="navbar-divider" aria-hidden="true" />
        <div className="navbar-group">
          {DEMO_LINKS.map((link) => (
            <NavLink key={link.id} link={link} currentPage={currentPage} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
