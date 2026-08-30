import { useEffect, useState } from 'react'
import { getCareers, runBFS, runDFS } from '../services/api'

function GraphAlgorithms() {
  const [node, setNode] = useState('')
  const [loading, setLoading] = useState(false)
  const [runningAlgorithm, setRunningAlgorithm] = useState(null)
  const [networkError, setNetworkError] = useState('')
  const [result, setResult] = useState(null)
  const [knownNodes, setKnownNodes] = useState(null)
  const [nodeTypeMap, setNodeTypeMap] = useState(null)

  // Builds a lowercase -> canonical-case lookup, and a canonical-name -> type
  // ("skill" | "interest" | "career") map, both derived entirely from the
  // real /api/careers response - no node names or types are invented.
  useEffect(() => {
    getCareers()
      .then((data) => {
        if (!data.success) return
        const caseMap = new Map()
        const typeMap = new Map()
        data.careers.forEach((career) => {
          caseMap.set(career.name.toLowerCase(), career.name)
          typeMap.set(career.name, 'career')
          career.required_skills.forEach((skill) => {
            caseMap.set(skill.toLowerCase(), skill)
            if (!typeMap.has(skill)) typeMap.set(skill, 'skill')
          })
          career.related_interests.forEach((interest) => {
            caseMap.set(interest.toLowerCase(), interest)
            if (!typeMap.has(interest)) typeMap.set(interest, 'interest')
          })
        })
        setKnownNodes(caseMap)
        setNodeTypeMap(typeMap)
      })
      .catch(() => {
        // Normalization and chip coloring are conveniences only - BFS/DFS
        // still work on raw input if this background fetch fails.
      })
  }, [])

  const runAlgorithm = async (algorithmFn, algorithmLabel) => {
    const trimmedNode = node.trim()
    if (!trimmedNode) {
      setNetworkError('Please enter a graph node before running an algorithm.')
      setResult(null)
      return
    }

    const normalizedNode = knownNodes?.get(trimmedNode.toLowerCase()) ?? trimmedNode

    setLoading(true)
    setRunningAlgorithm(algorithmLabel)
    setNetworkError('')
    setResult(null)

    try {
      const data = await algorithmFn(normalizedNode)
      setResult(data)
    } catch (error) {
      setNetworkError(error.message)
    } finally {
      setLoading(false)
      setRunningAlgorithm(null)
    }
  }

  const getNodeType = (stepName) => nodeTypeMap?.get(stepName) ?? 'unknown'

  return (
    <section className="graph-page">
      <h1>Graph Algorithms</h1>
      <p>
        Enter a skill, interest, or career node to see how Breadth-First Search (BFS) and
        Depth-First Search (DFS) traverse the career graph. These algorithms are for
        demonstration only — actual career recommendations use direct dictionary lookups,
        not graph traversal.
      </p>

      <div className="graph-controls">
        <label htmlFor="graphNodeInput" className="sr-only">
          Graph node (skill, interest, or career)
        </label>
        <input
          id="graphNodeInput"
          type="text"
          value={node}
          onChange={(event) => setNode(event.target.value)}
          placeholder="e.g. Python"
        />
        <button
          type="button"
          className="secondary-button"
          disabled={loading}
          onClick={() => runAlgorithm(runBFS, 'BFS')}
        >
          {loading && runningAlgorithm === 'BFS' ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Running...
            </>
          ) : (
            'Run BFS'
          )}
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={loading}
          onClick={() => runAlgorithm(runDFS, 'DFS')}
        >
          {loading && runningAlgorithm === 'DFS' ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Running...
            </>
          ) : (
            'Run DFS'
          )}
        </button>
      </div>

      <div className="graph-meta-row">
        <span className="field-hint">
          Capitalization does not need to match exactly — e.g. "python" still finds "Python".
        </span>
        <div className="node-type-legend">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-skill" /> Skill
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-interest" /> Interest
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch-career" /> Career
          </span>
        </div>
      </div>

      <div className="results-section">
        <h2>Traversal Result</h2>

        {loading && <p className="placeholder-text">Running traversal...</p>}

        {!loading && networkError && (
          <div className="message-box error-box">
            <p>{networkError}</p>
          </div>
        )}

        {!loading && !networkError && !result && (
          <p className="placeholder-text">
            Enter a node and choose BFS or DFS to see traversal results here.
          </p>
        )}

        {!loading && !networkError && result && !result.success && (
          <div className="message-box warning-box">
            <p>Node not found in the graph. Please enter a valid skill, interest, or career node.</p>
          </div>
        )}

        {!loading && !networkError && result && result.success && (
          <div className="traversal-result">
            <div className="traversal-result-head">
              <span
                className={`traversal-algorithm-badge traversal-algorithm-badge-${result.algorithm.toLowerCase()}`}
              >
                {result.algorithm}
              </span>
              <span className="traversal-start-node">
                Starting from <strong>{result.start_node}</strong> ({result.start_node_type})
              </span>
            </div>

            <div className="stat-row">
              <div className="stat-block">
                <span className="stat-value stat-primary">{result.visited_nodes.length}</span>
                <span className="stat-label">Visited Nodes</span>
              </div>
              <div className="stat-block">
                <span className="stat-value stat-success">{result.discovered_careers.length}</span>
                <span className="stat-label">Careers Discovered</span>
              </div>
            </div>

            <h3>Traversal Order</h3>
            <div className="traversal-order">
              {result.traversal_order.map((step, index) => (
                <span key={`${step}-${index}`}>
                  <span className={`traversal-step traversal-step-${getNodeType(step)}`}>{step}</span>
                  {index < result.traversal_order.length - 1 && (
                    <span className="traversal-arrow">↓</span>
                  )}
                </span>
              ))}
            </div>

            <h3>Discovered Careers</h3>
            {result.discovered_careers.length > 0 ? (
              <div className="skill-tag-list">
                {result.discovered_careers.map((career) => (
                  <span key={career} className="skill-tag skill-tag-neutral">
                    {career}
                  </span>
                ))}
              </div>
            ) : (
              <p className="placeholder-text">No careers were discovered from this node.</p>
            )}
          </div>
        )}
      </div>

      <div className="algorithm-explanation">
        <div>
          <h3>Breadth-First Search (BFS)</h3>
          <p>
            Explores the graph level by level using a queue, visiting all of a node's direct
            neighbors before moving further away.
          </p>
        </div>
        <div>
          <h3>Depth-First Search (DFS)</h3>
          <p>
            Explores as far as possible along one path before backtracking, typically
            implemented with recursion or an explicit stack.
          </p>
        </div>
      </div>
    </section>
  )
}

export default GraphAlgorithms
