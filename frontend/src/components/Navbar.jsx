import { useState } from 'react'

// Same ids as before (App.jsx's PAGES map is untouched) - only the labels
// changed for a compact, editorial top nav. One flat list, in the order
// requested.
const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'recommendation', label: 'Recommendation' },
  { id: 'lookup', label: 'Student Lookup' },
  { id: 'careers', label: 'Career Explorer' },
  { id: 'compare', label: 'Compare' },
  { id: 'graph', label: 'Graph Lab' },
  { id: 'testing', label: 'System Testing' },
  { id: 'gapanalysis', label: 'Insights' },
]

function NavLink({ link, currentPage, onNavigate, onAfterNavigate }) {
  return (
    <button
      type="button"
      className={`site-nav-link${currentPage === link.id ? ' active' : ''}`}
      onClick={() => {
        onNavigate(link.id)
        onAfterNavigate()
      }}
    >
      {link.label}
    </button>
  )
}

function Navbar({ currentPage, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="site-header">
      <span className="site-brand">AI Career Guidance</span>

      <nav className="site-nav" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.id}
            link={link}
            currentPage={currentPage}
            onNavigate={onNavigate}
            onAfterNavigate={closeMenu}
          />
        ))}
      </nav>

      <button
        type="button"
        className="site-menu-toggle"
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-nav"
      >
        <span className="sr-only">{isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {isMenuOpen ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {isMenuOpen && (
        <nav id="mobile-nav" className="site-nav-mobile" aria-label="Primary mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.id}
              link={link}
              currentPage={currentPage}
              onNavigate={onNavigate}
              onAfterNavigate={closeMenu}
            />
          ))}
        </nav>
      )}
    </header>
  )
}

export default Navbar
