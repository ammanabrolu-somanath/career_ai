const GAP_ENTRIES = [
  {
    id: 'scalability',
    gap: 'Scalability',
    currentApproach: 'A single human counselor meets students one at a time, in scheduled sessions.',
    whyItFails:
      'Counseling time does not scale — advising 500 students requires proportionally more counselor hours, and availability quickly becomes the bottleneck.',
    aiDsSolution:
      'Hash-based (dictionary) student lookup and direct dictionary-based career matching, giving average O(1) lookup with no per-student marginal cost.',
    howSystemAddresses:
      'get_student_profile() and get_candidate_careers() are plain Python dictionary lookups — the same operation whether 5 or 5,000 students query the system, with no appointment queue.',
  },
  {
    id: 'consistency',
    gap: 'Consistency',
    currentApproach: 'Each counselor gives advice based on their own judgment and experience.',
    whyItFails:
      'Two students with identical skills and interests can receive different advice from different counselors, or even from the same counselor on different days.',
    aiDsSolution:
      'A deterministic, rule-based weighted scoring formula (Skills 70% / Interests 20% / Academic Score 10%) applied identically to every profile.',
    howSystemAddresses:
      'score_career() computes the exact same formula for every student — identical inputs always produce identical rankings, every time.',
  },
  {
    id: 'bias',
    gap: 'Bias',
    currentApproach: "A human counselor's recommendations can be shaped by unconscious preferences.",
    whyItFails:
      'Bias is invisible and hard to audit — two equally qualified students are not guaranteed equal treatment.',
    aiDsSolution:
      'Transparent, rule-based matching — every recommendation is explainable from matched and missing skills/interests, not from any hidden preference.',
    howSystemAddresses:
      'Each recommendation includes matched/missing skills, matched/missing interests, and a generated explanation string, so exactly why a career was or was not recommended is always visible.',
  },
  {
    id: 'currency',
    gap: 'Currency of Knowledge',
    currentApproach:
      "A counselor's knowledge of in-demand careers depends on their own ongoing research and awareness.",
    whyItFails: 'Career and skill knowledge can quietly become outdated if the counselor does not actively keep up.',
    aiDsSolution:
      'A single, centrally maintained career dataset that every recommendation is generated from — updating it once updates every future recommendation.',
    howSystemAddresses:
      'ALL_SKILLS, ALL_INTERESTS, and the skill/interest-to-career graphs are all derived directly from one careers dataset, so the source of truth is centralized and consistent.',
  },
  {
    id: 'speed',
    gap: 'Speed',
    currentApproach: 'A student must schedule and wait for an available appointment slot.',
    whyItFails: 'Waiting time can stretch to days or weeks, delaying a decision the student needs to make sooner.',
    aiDsSolution: 'Instant, on-demand computation — recommendation generation completes within a single request.',
    howSystemAddresses:
      'Submitting a profile on the Career Recommendation page returns ranked results immediately, with no scheduling step.',
  },
]

const AI_DS_MAPPING = [
  {
    id: 'hashing',
    title: 'Hashing',
    description:
      'Student profiles are stored in a Python dictionary keyed by student ID, giving average O(1) lookup instead of scanning a list one by one. Addresses the Scalability and Speed gaps above.',
  },
  {
    id: 'graph-search',
    title: 'BFS / DFS Graph Exploration',
    description:
      'Breadth-First Search and Depth-First Search traverse the skill/interest/career relationship graph to demonstrate how graph search works. These are used for algorithm demonstration only — the recommendation engine itself finds candidate careers through direct dictionary lookups, not graph traversal.',
  },
  {
    id: 'scoring',
    title: 'Career Scoring',
    description:
      'A deterministic weighted formula (Skills 70% / Interests 20% / Academic Score 10%) produces a ranked list of career recommendations for every profile. Addresses the Consistency and Bias gaps above.',
  },
  {
    id: 'validation',
    title: 'Validation',
    description:
      'Detects likely typos with fuzzy matching, rejects out-of-range or malformed values, and flags a known contradictory-preference test case — so invalid or contradictory input is never silently accepted into a recommendation.',
  },
]

const RESOLVED_GAPS = [
  'Scalability — no appointment queue; any number of students can be served concurrently.',
  'Consistency — the same deterministic formula is applied to every profile.',
  'Bias — every recommendation is explainable from matched/missing skills and interests, not hidden preference.',
  'Currency of knowledge — one centrally maintained dataset feeds every recommendation.',
  'Speed — results are returned in a single request, with no waiting period.',
]

const SYSTEM_LIMITATIONS = [
  'Recommendations are limited strictly to the careers represented in our graph/dataset — a career that is not in the system\'s career data can never be recommended, unlike a human counselor who could suggest something outside a fixed list.',
  'The system cannot ask follow-up questions. It only reacts to the skills, interests, and academic score submitted in one form, and cannot probe deeper the way a conversation with a counselor could.',
  'The demo dataset (12 careers, 18 skills, 7 interests, plus a handful of sample student profiles) is intentionally small for this academic project — a real-world deployment would need a much larger, continuously maintained dataset.',
  'Dynamically-submitted student profiles are currently stored only in memory for as long as the backend process keeps running, so they do not persist across a server restart.',
]

function GapCard({ entry }) {
  return (
    <div>
      <h3>{entry.gap}</h3>
      <span className="skill-tag-group-label">Current Approach (Traditional Counseling)</span>
      <p>{entry.currentApproach}</p>
      <span className="skill-tag-group-label">Why It Fails</span>
      <p>{entry.whyItFails}</p>
      <span className="skill-tag-group-label">AI / DS Solution</span>
      <p>{entry.aiDsSolution}</p>
      <span className="skill-tag-group-label">How Our System Addresses It</span>
      <p>{entry.howSystemAddresses}</p>
    </div>
  )
}

function GapAnalysis() {
  return (
    <section className="gap-analysis-page">
      <h1>Gap Analysis</h1>
      <p>
        Session 7 requires a structured, honest comparison between traditional (human
        counselor-based) career guidance and our Smart Career Guidance System — identifying at
        least five concrete gaps, mapping each to a specific AI/data-structures technique, and
        disclosing the new limitations our own system introduces.
      </p>

      <h2>Gap Analysis Table</h2>
      <p className="field-hint">
        Five gaps, each covering: the traditional approach, why it fails, the AI/DS solution, and
        how our system specifically addresses it.
      </p>
      <div className="algorithm-explanation">
        {GAP_ENTRIES.map((entry) => (
          <GapCard key={entry.id} entry={entry} />
        ))}
      </div>

      <h2>How Our System Compares</h2>
      <div className="message-box suggestion-box">
        <h3>Traditional gaps our system addresses</h3>
        <ul>
          {RESOLVED_GAPS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="message-box warning-box">
        <h3>New limitations our system introduces</h3>
        <ul>
          {SYSTEM_LIMITATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <h2 className="system-algorithms-heading">AI / Data Structures Solution Mapping</h2>
      <div className="algorithm-explanation">
        {AI_DS_MAPPING.map((item) => (
          <div key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default GapAnalysis
