// Small inline stroke-icon set, matching the same visual language already
// used in Navbar.jsx / Home.jsx (plain SVG, no icon library, currentColor
// stroke) - reused directly where the concept already has an icon there,
// with one new icon added only where none existed yet.
const ICONS = {
  instant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" />
    </svg>
  ),
  deterministic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  ),
  explainable: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </svg>
  ),
  hashing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="20.5" y1="20.5" x2="15.3" y2="15.3" />
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
}

const QUICK_INSIGHTS = [
  {
    id: 'instant',
    title: 'Instant Recommendations',
    description: 'Career matches are generated within a single request — no scheduling or waiting.',
  },
  {
    id: 'deterministic',
    title: 'Deterministic Scoring',
    description: 'The same weighted formula is applied to every profile, so identical inputs always produce identical rankings.',
  },
  {
    id: 'explainable',
    title: 'Explainable Matching',
    description: 'Every recommendation lists the exact matched and missing skills and interests behind it.',
  },
  {
    id: 'hashing',
    title: 'Hash-Based Profile Lookup',
    description: 'Student profiles are retrieved from a dictionary keyed by student ID — average O(1) lookup.',
  },
  {
    id: 'graph',
    title: 'Graph-Based Career Relationships',
    description: 'Skills, interests, and careers are modeled as a graph, explorable through BFS and DFS traversal.',
  },
]

const COMPARISON_ITEMS = [
  {
    id: 'scalability',
    title: 'Scalability',
    traditional: 'Counselors work with students through scheduled, one-at-a-time sessions — availability limits how many students can be served.',
    smart: 'Profile lookup and career matching run as direct dictionary operations, so requests are served without an appointment queue, regardless of how many students use the system.',
    technology: 'Hash-based lookup',
  },
  {
    id: 'consistency',
    title: 'Consistency',
    traditional: "Advice depends on each counselor's own judgment and can vary from session to session.",
    smart: 'A single deterministic weighted formula is applied identically to every profile.',
    technology: 'Weighted scoring',
  },
  {
    id: 'bias',
    title: 'Bias',
    traditional: "A counselor's recommendations can be shaped by unconscious preferences.",
    smart: 'Every recommendation is explainable from matched and missing skills/interests, not a hidden preference.',
    technology: 'Rule-based matching',
  },
  {
    id: 'currency',
    title: 'Currency of Knowledge',
    traditional: "A counselor's awareness of in-demand careers depends on their own ongoing research.",
    smart: 'One centrally maintained career dataset feeds every recommendation, so updating it once updates every future result.',
    technology: 'Centralized career dataset',
  },
  {
    id: 'speed',
    title: 'Speed',
    traditional: 'A student must schedule and wait for an available appointment slot.',
    smart: 'Recommendations are generated instantly, within a single request.',
    technology: 'Instant computation',
  },
]

const TECHNIQUE_CARDS = [
  {
    id: 'hashing',
    title: 'Hashing',
    problem: 'Looking up a student profile quickly, no matter how many profiles exist.',
    where: 'Student profiles are stored in a Python dictionary keyed by student ID (backend student data store), with a dedicated experiment comparing it against sequential search.',
    complexity: 'Average O(1) lookup, vs. O(n) for a sequential scan.',
    explanation: 'A dictionary maps each student ID directly to its record, so retrieval does not depend on how many other profiles exist.',
  },
  {
    id: 'graph-search',
    title: 'BFS / DFS Graph Exploration',
    problem: 'Demonstrating how graph search algorithms explore relationships between skills, interests, and careers.',
    where: 'The Graph Algorithms page — Breadth-First Search, Depth-First Search, and a side-by-side comparison mode.',
    complexity: 'O(V + E) — every node and edge is visited at most once.',
    explanation: 'This is demonstration and exploration functionality only. The recommendation engine itself finds candidate careers through direct dictionary lookups, not graph traversal.',
  },
  {
    id: 'scoring',
    title: 'Career Scoring',
    problem: 'Turning a profile into a fair, consistent, ranked list of career matches.',
    where: 'The recommendation engine\'s scoring step, run once per candidate career for every request.',
    complexity: 'Linear in the number of candidate careers evaluated per request.',
    explanation: 'A weighted formula — Skills 70%, Interests 20%, Academic Score 10% — combines three component scores into one final ranking, applied identically to every profile.',
  },
]

const SYSTEM_LIMITATIONS = [
  'Recommendations are limited strictly to the careers represented in our graph/dataset — a career that is not in the system\'s career data can never be recommended, unlike a human counselor who could suggest something outside a fixed list.',
  'The system cannot ask follow-up questions. It only reacts to the skills, interests, and academic score submitted in one form, and cannot probe deeper the way a conversation with a counselor could.',
  'The demo dataset (12 careers, 18 skills, 7 interests, plus a handful of sample student profiles) is intentionally small for this project — a real-world deployment would need a much larger, continuously maintained dataset.',
  'Dynamically-submitted student profiles are currently stored only in memory for as long as the backend process keeps running, so they do not persist across a server restart.',
]

function InsightCard({ insight }) {
  return (
    <div>
      <span className="home-feature-icon" aria-hidden="true">
        {ICONS[insight.id]}
      </span>
      <h3>{insight.title}</h3>
      <p>{insight.description}</p>
    </div>
  )
}

function ComparisonCard({ item }) {
  return (
    <details className="score-details">
      <summary>{item.title}</summary>
      <div className="score-details-body">
        <span className="skill-tag-group-label">Traditional</span>
        <p>{item.traditional}</p>
        <div className="comparison-flow-arrow" aria-hidden="true">↓</div>
        <span className="skill-tag-group-label">Smart System</span>
        <p>{item.smart}</p>
        <span className="skill-tag skill-tag-neutral">Technology: {item.technology}</span>
      </div>
    </details>
  )
}

function TechniqueCard({ item }) {
  return (
    <div>
      <h3>{item.title}</h3>
      <span className="skill-tag-group-label">What It Addresses</span>
      <p>{item.problem}</p>
      <span className="skill-tag-group-label">Where It Appears</span>
      <p>{item.where}</p>
      <span className="skill-tag-group-label">Complexity</span>
      <p>{item.complexity}</p>
      <span className="skill-tag-group-label">Explanation</span>
      <p>{item.explanation}</p>
    </div>
  )
}

function GapAnalysis() {
  return (
    <section className="gap-analysis-page">
      <span className="stat-pill stat-primary">System analysis</span>
      <h1>System Insights</h1>
      <p>
        Understand how our career guidance engine compares with traditional counseling and how
        its underlying data structures make recommendations possible.
      </p>

      <div className="algorithm-explanation">
        {QUICK_INSIGHTS.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <h2>Traditional vs. Smart Guidance</h2>
      <p className="field-hint">
        Expand any comparison to see how a traditional gap is addressed, and which technique
        makes it possible.
      </p>
      <div className="algorithm-explanation">
        {COMPARISON_ITEMS.map((item) => (
          <ComparisonCard key={item.id} item={item} />
        ))}
      </div>

      <h2>How the Engine Addresses These Gaps</h2>
      <p className="field-hint">
        A student profile moves through a fixed, deterministic pipeline to become a ranked list
        of recommendations.
      </p>
      <div className="benchmark-visual" aria-hidden="true">
        <div className="benchmark-chain">
          <div className="benchmark-chain-steps">
            <span className="benchmark-chain-step">Student Profile</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Profile Lookup</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Career Matching</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Weighted Scoring</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step benchmark-chain-target">Ranked Recommendations</span>
          </div>
        </div>
      </div>
      <p className="field-hint">
        Student Profile is validated first (typos, missing fields, and contradictory input are
        checked). Profile Lookup uses <strong>hashing</strong>. Career Matching uses{' '}
        <strong>rule-based, direct dictionary lookup</strong> — not graph traversal. Weighted
        Scoring applies the <strong>70 / 20 / 10</strong> formula described below.
      </p>
      <p className="field-hint">
        BFS and DFS power the separate Graph Algorithms exploration and comparison tools — they
        are not part of this recommendation pipeline.
      </p>

      <h2>AI / Data Structures</h2>
      <div className="algorithm-explanation">
        {TECHNIQUE_CARDS.map((item) => (
          <TechniqueCard key={item.id} item={item} />
        ))}
      </div>

      <h2>Current System Limitations</h2>
      <div className="message-box warning-box">
        <ul>
          {SYSTEM_LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <h2>Team Reflections</h2>
      <details className="score-details">
        <summary>View team reflections</summary>
        <div className="score-details-body">
          <p className="placeholder-text">
            Individual team reflections have not been added yet. Once collected, each member's
            reflection can be listed here as its own expandable entry.
          </p>
        </div>
      </details>
    </section>
  )
}

export default GapAnalysis
