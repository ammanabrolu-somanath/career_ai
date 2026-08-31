import { useEffect, useMemo, useRef, useState } from 'react'
import { getCareers, runBFS, runDFS } from '../services/api'

const EMPTY_ALGORITHM_STATE = { node: null, result: null, loading: false, error: '' }

function addEdge(adjacency, a, b) {
  if (!adjacency.has(a)) adjacency.set(a, new Set())
  if (!adjacency.has(b)) adjacency.set(b, new Set())
  adjacency.get(a).add(b)
  adjacency.get(b).add(a)
}

// Shortest-hop distance from the start node, restricted to nodes that were
// actually visited in this traversal result. This is a structural graph
// fact (there is exactly one correct shortest-path distance for a given
// graph) computed independently of BFS/DFS's own internal choices - it
// never invents a relationship, it only measures real ones.
function computeLevels(startNode, visitedNodes, adjacency) {
  const visitedSet = new Set(visitedNodes)
  const levels = new Map([[startNode, 0]])
  const queue = [startNode]
  let head = 0

  while (head < queue.length) {
    const current = queue[head]
    head += 1
    const currentLevel = levels.get(current)
    const neighbors = adjacency?.get(current)
    if (!neighbors) continue
    neighbors.forEach((neighbor) => {
      if (!visitedSet.has(neighbor) || levels.has(neighbor)) return
      levels.set(neighbor, currentLevel + 1)
      queue.push(neighbor)
    })
  }

  return levels
}

function GraphNode({ name, order, type, isStart }) {
  return (
    <div className={`graph-node${isStart ? ' graph-node-start' : ''}`}>
      <span className="graph-node-order">{order}</span>
      <span className={`graph-node-label traversal-step traversal-step-${type}`}>{name}</span>
    </div>
  )
}

function BfsLevelDiagram({ result, nodeTypeMap, adjacency }) {
  const getNodeType = (name) => nodeTypeMap?.get(name) ?? 'unknown'

  const orderIndexMap = useMemo(() => {
    const map = new Map()
    result.traversal_order.forEach((name, index) => map.set(name, index + 1))
    return map
  }, [result])

  const levels = useMemo(
    () => computeLevels(result.start_node, result.visited_nodes, adjacency),
    [result, adjacency]
  )

  // Group visited nodes by their computed level. Any visited node whose
  // level could not be computed (only possible if the background
  // getCareers() adjacency fetch failed) is never silently dropped - it
  // is still listed, in its own trailing group, so no real data vanishes.
  const { levelGroups, unplacedNodes } = useMemo(() => {
    const groups = []
    const unplaced = []
    const byTraversalOrder = (a, b) => (orderIndexMap.get(a) ?? 0) - (orderIndexMap.get(b) ?? 0)

    result.visited_nodes.forEach((name) => {
      const level = levels.get(name)
      if (level === undefined) {
        unplaced.push(name)
        return
      }
      if (!groups[level]) groups[level] = []
      groups[level].push(name)
    })

    groups.forEach((group) => group?.sort(byTraversalOrder))
    unplaced.sort(byTraversalOrder)
    return { levelGroups: groups, unplacedNodes: unplaced }
  }, [result, levels, orderIndexMap])

  const presentLevels = levelGroups
    .map((nodes, levelIndex) => (nodes ? { levelIndex, nodes } : null))
    .filter(Boolean)

  return (
    <div
      className="graph-diagram"
      role="group"
      aria-label={`BFS level diagram starting from ${result.start_node}. Nodes are grouped by their shortest distance from the start node, level 0 being the start node itself, with each node also showing its 1-indexed visit order. Arrows show progression from one level to the next.`}
    >
      {presentLevels.map(({ levelIndex, nodes }, position) => (
        <div key={levelIndex}>
          <div className="bfs-level-row">
            <span className="bfs-level-label">Level {levelIndex}</span>
            <div className="bfs-level-nodes">
              {nodes.map((name) => (
                <GraphNode
                  key={name}
                  name={name}
                  order={orderIndexMap.get(name)}
                  type={getNodeType(name)}
                  isStart={name === result.start_node}
                />
              ))}
            </div>
          </div>
          {position < presentLevels.length - 1 && (
            <div className="bfs-level-arrow" aria-hidden="true">
              ↓
            </div>
          )}
        </div>
      ))}

      {unplacedNodes.length > 0 && (
        <div className="bfs-level-row">
          <span className="bfs-level-label">Unplaced</span>
          <div className="bfs-level-nodes">
            {unplacedNodes.map((name) => (
              <GraphNode
                key={name}
                name={name}
                order={orderIndexMap.get(name)}
                type={getNodeType(name)}
                isStart={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DfsPathList({ result, nodeTypeMap }) {
  const getNodeType = (name) => nodeTypeMap?.get(name) ?? 'unknown'

  return (
    <div
      className="dfs-path-list"
      role="group"
      aria-label={`DFS traversal path starting from ${result.start_node}, listed top to bottom in the exact order it was visited. The connecting line shows visiting sequence, not a graph relationship.`}
    >
      {result.traversal_order.map((name, index) => (
        <GraphNode
          key={`${name}-${index}`}
          name={name}
          order={index + 1}
          type={getNodeType(name)}
          isStart={name === result.start_node}
        />
      ))}
    </div>
  )
}

// Renders one algorithm's current state (BFS or DFS) using the exact
// existing single-result presentation - loading / error / not-found /
// success - so single-run mode and comparison mode share one code path
// and never duplicate or recompute traversal data.
function AlgorithmPanel({ state, nodeTypeMap, adjacency }) {
  const { result, loading, error } = state

  if (loading) {
    return <p className="placeholder-text">Running traversal...</p>
  }

  if (error) {
    return (
      <div className="message-box error-box">
        <p>{error}</p>
      </div>
    )
  }

  if (!result) return null

  if (!result.success) {
    return (
      <div className="message-box warning-box">
        <p>Node not found in the graph. Please enter a valid skill, interest, or career node.</p>
      </div>
    )
  }

  return (
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

      <h3>{result.algorithm === 'BFS' ? 'BFS Level Diagram' : 'DFS Traversal Path'}</h3>
      <p className="field-hint graph-diagram-hint">
        {result.algorithm === 'BFS'
          ? 'Each row is one BFS level. Nodes in the same row share the same shortest-hop distance from the start node, and the arrows show progression from one level to the next — not a specific connection between two nodes.'
          : 'Nodes are listed top to bottom in the exact order DFS visited them. The connecting line shows traversal sequence only — it does not necessarily represent a direct graph relationship between consecutive nodes.'}
      </p>

      {result.algorithm === 'BFS' ? (
        <BfsLevelDiagram result={result} nodeTypeMap={nodeTypeMap} adjacency={adjacency} />
      ) : (
        <DfsPathList result={result} nodeTypeMap={nodeTypeMap} />
      )}

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
  )
}

function GraphAlgorithms() {
  const [node, setNode] = useState('')
  const [networkError, setNetworkError] = useState('')
  const [bfs, setBfs] = useState(EMPTY_ALGORITHM_STATE)
  const [dfs, setDfs] = useState(EMPTY_ALGORITHM_STATE)
  // Explicit comparison-mode flag: true only while the user is looking at
  // a result produced by the "Compare BFS and DFS" button. Comparison
  // layout must never be inferred just from bfs.node === dfs.node - that
  // would let running BFS then DFS individually for the same node look
  // like a comparison the user never asked for.
  const [isComparing, setIsComparing] = useState(false)
  const [knownNodes, setKnownNodes] = useState(null)
  const [nodeTypeMap, setNodeTypeMap] = useState(null)
  const [adjacency, setAdjacency] = useState(null)

  // Every algorithm-triggering action (single run or compare) increments
  // this before firing its request(s). A response is only ever applied if
  // the token it started with is still current - this is what stops a
  // slow, superseded request (e.g. an earlier Compare click) from
  // overwriting the results of a newer one.
  const requestTokenRef = useRef(0)

  // Builds a lowercase -> canonical-case lookup, a canonical-name -> type
  // ("skill" | "interest" | "career") map, and the real bidirectional
  // skill/interest <-> career adjacency (mirroring the backend's
  // DEMO_TRAVERSAL_GRAPH derivation) - all derived entirely from the real
  // /api/careers response. No node, type, or relationship is invented.
  useEffect(() => {
    getCareers()
      .then((data) => {
        if (!data.success) return
        const caseMap = new Map()
        const typeMap = new Map()
        const adjacencyMap = new Map()
        data.careers.forEach((career) => {
          caseMap.set(career.name.toLowerCase(), career.name)
          typeMap.set(career.name, 'career')
          career.required_skills.forEach((skill) => {
            caseMap.set(skill.toLowerCase(), skill)
            if (!typeMap.has(skill)) typeMap.set(skill, 'skill')
            addEdge(adjacencyMap, skill, career.name)
          })
          career.related_interests.forEach((interest) => {
            caseMap.set(interest.toLowerCase(), interest)
            if (!typeMap.has(interest)) typeMap.set(interest, 'interest')
            addEdge(adjacencyMap, interest, career.name)
          })
        })
        setKnownNodes(caseMap)
        setNodeTypeMap(typeMap)
        setAdjacency(adjacencyMap)
      })
      .catch(() => {
        // Normalization, chip coloring, and BFS levels are conveniences
        // only - BFS/DFS still work on raw input, and the DFS path list
        // still shows every node, if this background fetch fails.
      })
  }, [])

  const anyLoading = bfs.loading || dfs.loading

  const resolveNormalizedNode = () => {
    const trimmedNode = node.trim()
    if (!trimmedNode) {
      setNetworkError('Please enter a graph node before running an algorithm.')
      return null
    }
    setNetworkError('')
    return knownNodes?.get(trimmedNode.toLowerCase()) ?? trimmedNode
  }

  // Running BFS or DFS individually always exits comparison mode and
  // clears the OTHER algorithm's slot, so only the requested algorithm's
  // normal result is ever shown - never a leftover pair that could look
  // like an unrequested comparison, and never a stale result from a
  // previous node.
  const runSingleAlgorithm = async (kind) => {
    const normalizedNode = resolveNormalizedNode()
    if (!normalizedNode) return

    setIsComparing(false)
    const setState = kind === 'BFS' ? setBfs : setDfs
    const otherSetState = kind === 'BFS' ? setDfs : setBfs
    const algorithmFn = kind === 'BFS' ? runBFS : runDFS

    otherSetState(EMPTY_ALGORITHM_STATE)

    const token = ++requestTokenRef.current
    setState({ node: normalizedNode, result: null, loading: true, error: '' })

    try {
      const data = await algorithmFn(normalizedNode)
      if (requestTokenRef.current !== token) return
      setState({ node: normalizedNode, result: data, loading: false, error: '' })
    } catch (error) {
      if (requestTokenRef.current !== token) return
      setState({ node: normalizedNode, result: null, loading: false, error: error.message })
    }
  }

  const runCompare = async () => {
    const normalizedNode = resolveNormalizedNode()
    if (!normalizedNode) return

    setIsComparing(true)
    const token = ++requestTokenRef.current
    setBfs({ node: normalizedNode, result: null, loading: true, error: '' })
    setDfs({ node: normalizedNode, result: null, loading: true, error: '' })

    // Each side updates its own state as soon as it resolves - so if one
    // algorithm finishes first, its result appears immediately rather
    // than waiting for the slower one. Promise.allSettled (not
    // Promise.all) is still used to wait for both before this function
    // returns, and - critically - so that one side failing can never
    // suppress or hide the other side's successful result.
    const bfsPromise = runBFS(normalizedNode)
      .then((data) => {
        if (requestTokenRef.current !== token) return
        setBfs({ node: normalizedNode, result: data, loading: false, error: '' })
      })
      .catch((error) => {
        if (requestTokenRef.current !== token) return
        setBfs({ node: normalizedNode, result: null, loading: false, error: error.message })
      })

    const dfsPromise = runDFS(normalizedNode)
      .then((data) => {
        if (requestTokenRef.current !== token) return
        setDfs({ node: normalizedNode, result: data, loading: false, error: '' })
      })
      .catch((error) => {
        if (requestTokenRef.current !== token) return
        setDfs({ node: normalizedNode, result: null, loading: false, error: error.message })
      })

    await Promise.allSettled([bfsPromise, dfsPromise])
  }

  // Side-by-side comparison layout appears ONLY when the user explicitly
  // clicked "Compare BFS and DFS" (isComparing). The bfs.node === dfs.node
  // check is kept only as a defensive guard against ever rendering the
  // comparison grid with a mismatched pair - runCompare always sets both
  // to the same node, so in practice this is always true while comparing.
  const showComparison = isComparing && Boolean(bfs.node) && Boolean(dfs.node) && bfs.node === dfs.node

  const hasBfsContent = Boolean(bfs.node)
  const hasDfsContent = Boolean(dfs.node)

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
          disabled={anyLoading}
          onClick={() => runSingleAlgorithm('BFS')}
        >
          {bfs.loading ? (
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
          disabled={anyLoading}
          onClick={() => runSingleAlgorithm('DFS')}
        >
          {dfs.loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Running...
            </>
          ) : (
            'Run DFS'
          )}
        </button>
        <button type="button" className="primary-button" disabled={anyLoading} onClick={runCompare}>
          {anyLoading && isComparing ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Comparing...
            </>
          ) : (
            'Compare BFS and DFS'
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
        <h2>{showComparison ? 'BFS vs DFS Comparison' : 'Traversal Result'}</h2>

        {networkError && (
          <div className="message-box error-box">
            <p>{networkError}</p>
          </div>
        )}

        {!networkError && !hasBfsContent && !hasDfsContent && (
          <p className="placeholder-text">
            Enter a node and choose Run BFS, Run DFS, or Compare BFS and DFS to see traversal
            results here.
          </p>
        )}

        {!networkError && showComparison && (
          <div className="comparison-mode">
            <p className="comparison-intro">
              Comparing BFS and DFS starting from <strong>{bfs.node}</strong>.
            </p>
            <div className="comparison-grid">
              <div className="comparison-column comparison-column-bfs">
                <span className="comparison-column-label comparison-column-label-bfs">BFS</span>
                <AlgorithmPanel state={bfs} nodeTypeMap={nodeTypeMap} adjacency={adjacency} />
              </div>
              <div className="comparison-column comparison-column-dfs">
                <span className="comparison-column-label comparison-column-label-dfs">DFS</span>
                <AlgorithmPanel state={dfs} nodeTypeMap={nodeTypeMap} adjacency={adjacency} />
              </div>
            </div>
          </div>
        )}

        {!networkError && !showComparison && hasBfsContent && (
          <AlgorithmPanel state={bfs} nodeTypeMap={nodeTypeMap} adjacency={adjacency} />
        )}

        {!networkError && !showComparison && hasDfsContent && (
          <AlgorithmPanel state={dfs} nodeTypeMap={nodeTypeMap} adjacency={adjacency} />
        )}
      </div>

      <div className="algorithm-explanation">
        <div>
          <h3>Breadth-First Search (BFS)</h3>
          <p>Visits all neighboring nodes before moving further away.</p>
          <dl className="algorithm-complexity-list">
            <dt>Traversal pattern</dt>
            <dd>Level-by-level exploration.</dd>
            <dt>Time complexity</dt>
            <dd>O(V + E)</dd>
          </dl>
        </div>
        <div>
          <h3>Depth-First Search (DFS)</h3>
          <p>Follows one path as deep as possible before backtracking.</p>
          <dl className="algorithm-complexity-list">
            <dt>Traversal pattern</dt>
            <dd>Depth-first exploration with backtracking.</dd>
            <dt>Time complexity</dt>
            <dd>O(V + E)</dd>
          </dl>
        </div>
      </div>
      <p className="field-hint algorithm-complexity-note">
        V represents the number of vertices (nodes) and E represents the number of edges
        (connections) in the graph.
      </p>
    </section>
  )
}

export default GraphAlgorithms
