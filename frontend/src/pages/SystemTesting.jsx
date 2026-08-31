import { useState } from 'react'
import { getRecommendations, validateProfile, getStudent, runBFS, runDFS } from '../services/api'

/**
 * Each test function is self-contained with its own try/catch, so one
 * failing API call can never crash this page or stop the remaining tests
 * from running. Every test resolves to a result object, never throws.
 */

async function testValidRecommendation() {
  const name = 'Valid Recommendation'
  const explanation =
    'Calls getRecommendations() with a strong AI/Data profile and checks that a ranked result is returned.'
  try {
    const data = await getRecommendations({
      student_id: 'TEST001',
      name: 'Test Student',
      academic_score: 85,
      skills: ['Python', 'Machine Learning', 'Mathematics', 'Statistics', 'Data Analysis'],
      interests: ['Artificial Intelligence', 'Data'],
    })
    const top = data.recommendations && data.recommendations[0]
    const passed = Boolean(data.success && top)
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Top career: ${top.career_name} (${top.final_score_percentage}% match)`
        : 'No successful, ranked recommendation was returned.',
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testTypoDetection() {
  const name = 'Skill Typo Detection'
  const explanation =
    'Submits the misspelled skill "Pyhton" and checks that the backend returns a spelling suggestion.'
  try {
    const data = await getRecommendations({
      student_id: 'TEST002',
      name: 'Typo Test',
      academic_score: 80,
      skills: ['Pyhton', 'Machine Learning'],
      interests: ['Artificial Intelligence'],
    })
    const suggestion = data.suggestions && data.suggestions.Pyhton
    const passed = Boolean(suggestion)
    return {
      name,
      explanation,
      passed,
      details: passed ? `Suggestion: "Pyhton" → "${suggestion}"` : 'No suggestion was returned for "Pyhton".',
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testEmptyProfileValidation() {
  const name = 'Empty Profile Validation'
  const explanation = 'Calls validateProfile() with an empty profile and checks that it is correctly rejected.'
  try {
    const data = await validateProfile({})
    const passed = data.valid === false
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Correctly rejected. Errors: ${data.errors.join('; ')}`
        : `Expected valid:false, got valid:${data.valid}`,
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testInvalidStudentLookup() {
  const name = 'Invalid Student Lookup'
  const explanation = 'Calls getStudent("INVALID999") and checks for a clean not-found response.'
  try {
    const data = await getStudent('INVALID999')
    const passed = data.success === false
    return {
      name,
      explanation,
      passed,
      details: passed ? `Correctly not found: "${data.error}"` : 'Expected success:false for an unknown student ID.',
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testBFS() {
  const name = 'BFS Graph Traversal'
  const explanation = 'Calls runBFS("Python") and checks that the traversal succeeds.'
  try {
    const data = await runBFS('Python')
    const passed = data.success === true
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Visited nodes: ${data.visited_nodes.length}, Discovered careers: ${data.discovered_careers.length}`
        : data.error || 'BFS did not succeed.',
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testDFS() {
  const name = 'DFS Graph Traversal'
  const explanation = 'Calls runDFS("Python") and checks that the traversal succeeds.'
  try {
    const data = await runDFS('Python')
    const passed = data.success === true
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Visited nodes: ${data.visited_nodes.length}, Discovered careers: ${data.discovered_careers.length}`
        : data.error || 'DFS did not succeed.',
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testContradictoryPreferenceDetection() {
  const name = 'Contradictory Preference Detection'
  const explanation =
    'Calls validateProfile() with only the Session 5 contradictory pair ("Low-Stress Work" + "High-Growth Startup") as interests, and checks that it is detected and reported without invalidating the profile.'
  try {
    const data = await validateProfile({
      student_id: 'TEST005',
      name: 'Contradiction Test',
      skills: ['Python'],
      interests: ['Low-Stress Work', 'High-Growth Startup'],
    })
    const detected = Array.isArray(data.contradictory_preferences) && data.contradictory_preferences.length > 0
    const stillValid = data.valid === true
    const passed = detected && stillValid
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Detected: "${data.contradictory_preferences[0].pair.join('" + "')}". Profile remained valid (valid: ${data.valid}), as it should.`
        : `Expected contradictory_preferences to be detected and valid:true. Got detected:${detected}, valid:${data.valid}.`,
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testAcademicWeightRedistribution() {
  const name = 'Missing Academic Score Weight Redistribution'
  const explanation =
    'Calls getRecommendations() without academic_score and checks that weights_used shows academic weighting skipped, with Skill/Interest weights redistributed while preserving the 7:2 ratio.'
  try {
    const data = await getRecommendations({
      student_id: 'TEST006',
      name: 'Redistribution Test',
      skills: ['Python', 'Machine Learning', 'Mathematics', 'Statistics', 'Data Analysis'],
      interests: ['Artificial Intelligence', 'Data'],
    })
    const top = data.recommendations && data.recommendations[0]
    const weights = top && top.weights_used

    const academicSkipped =
      Boolean(weights) && weights.academic_score_provided === false && weights.academic_weight === 0

    const expectedSkillWeight = 0.7 / 0.9
    const expectedInterestWeight = 0.2 / 0.9
    const skillWeightCorrect = Boolean(weights) && Math.abs(weights.skill_weight - expectedSkillWeight) < 0.001
    const interestWeightCorrect =
      Boolean(weights) && Math.abs(weights.interest_weight - expectedInterestWeight) < 0.001
    const ratioPreserved =
      Boolean(weights) && Math.abs(weights.skill_weight / weights.interest_weight - 0.7 / 0.2) < 0.01

    const passed = Boolean(
      data.success && top && academicSkipped && skillWeightCorrect && interestWeightCorrect && ratioPreserved
    )

    return {
      name,
      explanation,
      passed,
      details: passed
        ? `academic_score_provided: false. skill_weight: ${weights.skill_weight} (~77.8%), interest_weight: ${weights.interest_weight} (~22.2%), academic_weight: ${weights.academic_weight} — original 7:2 ratio preserved.`
        : `Unexpected weights_used for missing academic_score: ${JSON.stringify(weights)}`,
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

async function testInvalidGraphNode() {
  const name = 'Invalid Graph Node Handling'
  const explanation =
    'Calls runBFS("NonexistentNode123") and checks that the backend cleanly returns success:false with an error message instead of crashing.'
  try {
    const data = await runBFS('NonexistentNode123')
    const passed = data.success === false && typeof data.error === 'string' && data.error.length > 0
    return {
      name,
      explanation,
      passed,
      details: passed
        ? `Correctly handled as not found: "${data.error}"`
        : `Expected success:false with an error message. Got: ${JSON.stringify(data)}`,
    }
  } catch (error) {
    return { name, explanation, passed: false, details: error.message }
  }
}

const TEST_FUNCTIONS = [
  testValidRecommendation,
  testTypoDetection,
  testEmptyProfileValidation,
  testInvalidStudentLookup,
  testBFS,
  testDFS,
  testContradictoryPreferenceDetection,
  testAcademicWeightRedistribution,
  testInvalidGraphNode,
]

/**
 * Client-side hashing performance demonstration.
 *
 * The real backend (`data/student_profiles.py`) looks up students with
 * `STUDENTS.get(student_id)` - a genuine Python dict/hash lookup - but that
 * dict only holds 5 sample profiles, far too few to show a visible timing
 * gap against a linear scan. So this benchmark builds its own larger,
 * synthetic dataset in the browser and times a plain Array scan against a
 * JS Map, to illustrate the same O(n)-vs-average-O(1) principle at a scale
 * where the difference is actually measurable. It never touches the real
 * backend, the real STUDENTS data, or the network.
 */
const BENCHMARK_DATASET_SIZES = [100, 1000, 10000, 100000]

// Fewer iterations at larger sizes keeps the (synchronous) linear-search
// pass from blocking the page for too long, while still giving a stable
// average lookup time.
const BENCHMARK_ITERATIONS_BY_SIZE = {
  100: 5000,
  1000: 2000,
  10000: 300,
  100000: 50,
}

const BENCHMARK_RESOLUTION_FLOOR_MS = 0.001

function generateSyntheticProfiles(size) {
  const profiles = new Array(size)
  for (let i = 0; i < size; i++) {
    profiles[i] = {
      student_id: `SIM${String(i + 1).padStart(6, '0')}`,
      name: `Student ${i + 1}`,
    }
  }
  return profiles
}

function runLookupBenchmark(size) {
  const profiles = generateSyntheticProfiles(size)
  const profileMap = new Map(profiles.map((profile) => [profile.student_id, profile]))

  // Target sits at the very end of the array, so linear search is forced
  // through the full dataset - its true O(n) worst case.
  const targetIndex = size - 1
  const targetId = profiles[targetIndex].student_id
  const iterations = BENCHMARK_ITERATIONS_BY_SIZE[size]

  // Records examined before the match - counted once, outside the timed
  // loops, so it never affects the measured lookup times.
  let comparisons = 0
  for (const profile of profiles) {
    comparisons++
    if (profile.student_id === targetId) break
  }

  let linearResult = null
  const linearStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    linearResult = profiles.find((profile) => profile.student_id === targetId)
  }
  const linearEnd = performance.now()

  let hashResult = null
  const hashStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    hashResult = profileMap.get(targetId)
  }
  const hashEnd = performance.now()

  return {
    datasetSize: size,
    targetId,
    targetPosition: targetIndex + 1,
    iterations,
    comparisons,
    linearAvgMs: (linearEnd - linearStart) / iterations,
    hashAvgMs: (hashEnd - hashStart) / iterations,
    linearResultId: linearResult ? linearResult.student_id : null,
    hashResultId: hashResult ? hashResult.student_id : null,
  }
}

function formatMs(ms) {
  return `${ms.toFixed(4)} ms`
}

function HashBenchmarkPanel() {
  const [datasetSize, setDatasetSize] = useState(BENCHMARK_DATASET_SIZES[1])
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  const handleSizeChange = (event) => {
    setDatasetSize(Number(event.target.value))
    setResult(null)
  }

  const handleRun = () => {
    setRunning(true)
    setResult(null)
    // Deferred one tick so the "Running..." state paints before the
    // (synchronous) benchmark work runs.
    setTimeout(() => {
      setResult(runLookupBenchmark(datasetSize))
      setRunning(false)
    }, 0)
  }

  const bothFoundTarget =
    result && result.linearResultId === result.targetId && result.hashResultId === result.targetId

  let conclusion = null
  if (result) {
    const sizeLabel = result.datasetSize.toLocaleString()
    const comparisonsLabel = result.comparisons.toLocaleString()
    let speedLine
    if (result.hashAvgMs < BENCHMARK_RESOLUTION_FLOOR_MS) {
      speedLine = 'Hash lookup time was below reliable measurement resolution in this browser.'
    } else {
      const ratio = result.linearAvgMs / result.hashAvgMs
      speedLine = `Hash lookup measured roughly ${ratio.toFixed(1)}x faster than linear search on this run.`
    }
    conclusion = `With ${sizeLabel} profiles, linear search examined ${comparisonsLabel} record(s) to reach the target, while hash lookup accessed it directly by key. ${speedLine}`
  }

  return (
    <div className="benchmark-panel">
      <h4 className="benchmark-heading">Hash Lookup Performance Demonstration</h4>
      <p className="benchmark-intro">
        The real backend looks up a student with a single Python dictionary access -{' '}
        <code>STUDENTS.get(student_id)</code> - but that dictionary only holds 5 sample profiles,
        too few to show a visible timing difference. This demonstration builds a larger synthetic
        dataset in your browser and times a plain array scan against a JS <code>Map</code>, to
        illustrate the same Linear Search O(n) vs. Hash Lookup average O(1) principle at a scale
        where the difference is actually measurable.
      </p>
      <p className="benchmark-disclaimer field-hint">
        This does not measure Flask, network latency, or the live <code>/api/student</code>{' '}
        request - only the lookup operation itself, run entirely in this browser.
      </p>

      <div className="benchmark-visual" aria-hidden="true">
        <div className="benchmark-chain">
          <span className="benchmark-chain-label">Linear Search</span>
          <div className="benchmark-chain-steps">
            <span className="benchmark-chain-step">Profile 1</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Profile 2</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Profile 3</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">...</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step benchmark-chain-target">Target</span>
          </div>
        </div>
        <div className="benchmark-chain">
          <span className="benchmark-chain-label">Hash Lookup</span>
          <div className="benchmark-chain-steps">
            <span className="benchmark-chain-step">Student ID</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step">Hash Map</span>
            <span className="benchmark-chain-arrow">→</span>
            <span className="benchmark-chain-step benchmark-chain-target">Target</span>
          </div>
        </div>
      </div>

      <div className="benchmark-controls">
        <label className="benchmark-size-label">
          Dataset Size
          <select value={datasetSize} onChange={handleSizeChange} disabled={running}>
            {BENCHMARK_DATASET_SIZES.map((size) => (
              <option key={size} value={size}>
                {size.toLocaleString()} profiles
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="secondary-button" onClick={handleRun} disabled={running}>
          {running ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Running...
            </>
          ) : (
            'Run Performance Test'
          )}
        </button>
      </div>

      {result && (
        <div className="benchmark-results">
          <div className="stat-row">
            <div className="stat-block">
              <span className="stat-value">{result.datasetSize.toLocaleString()}</span>
              <span className="stat-label">Dataset Size</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">{result.targetPosition.toLocaleString()}</span>
              <span className="stat-label">Target Position</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">{result.iterations.toLocaleString()}</span>
              <span className="stat-label">Lookup Iterations</span>
            </div>
          </div>

          <div className="benchmark-method-grid">
            <div className="benchmark-method-card benchmark-method-linear">
              <span className="benchmark-method-title">Linear Search</span>
              <span className="benchmark-method-complexity">O(n)</span>
              <span className="stat-value">{formatMs(result.linearAvgMs)}</span>
              <span className="stat-label">Average Lookup Time</span>
              <p className="benchmark-method-detail">
                {result.comparisons.toLocaleString()} record(s) examined before match
              </p>
            </div>
            <div className="benchmark-method-card benchmark-method-hash">
              <span className="benchmark-method-title">Hash Lookup</span>
              <span className="benchmark-method-complexity">Average O(1)</span>
              <span className="stat-value">{formatMs(result.hashAvgMs)}</span>
              <span className="stat-label">Average Lookup Time</span>
              <p className="benchmark-method-detail">Direct key lookup</p>
            </div>
          </div>

          <p className="benchmark-conclusion">{conclusion}</p>

          <p className="benchmark-disclaimer field-hint">
            {bothFoundTarget
              ? `Both methods returned the same profile (${result.targetId}), confirming the comparison is valid.`
              : 'Warning: the two methods did not return the same profile for this run.'}
          </p>
        </div>
      )}
    </div>
  )
}

function SystemTesting() {
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [results, setResults] = useState([])

  const runTests = async () => {
    setLoading(true)
    setResults([])

    const outcomes = []
    for (const testFn of TEST_FUNCTIONS) {
      try {
        outcomes.push(await testFn())
      } catch (error) {
        // Safety net only - every testFn above already handles its own
        // errors, so this keeps the whole test run alive no matter what.
        outcomes.push({
          name: testFn.name,
          explanation: 'Unexpected error while running this test.',
          passed: false,
          details: error.message,
        })
      }
    }

    setResults(outcomes)
    setHasRun(true)
    setLoading(false)
  }

  const totalTests = results.length
  const passedTests = results.filter((result) => result.passed).length
  const failedTests = totalTests - passedTests

  return (
    <section className="system-testing-page">
      <h1>System Testing &amp; Insights</h1>
      <p>
        This page demonstrates how the AI-Based Smart Career Guidance System handles valid
        inputs, invalid inputs, recommendations, graph algorithms, and student lookup.
      </p>

      <button type="button" className="primary-button" onClick={runTests} disabled={loading}>
        {loading ? (
          <>
            <span className="button-spinner" aria-hidden="true" />
            Running Tests...
          </>
        ) : (
          'Run System Tests'
        )}
      </button>

      <div className="results-section">
        <h2>Test Results</h2>

        {loading && <p className="placeholder-text">Running system tests...</p>}

        {!loading && !hasRun && (
          <p className="placeholder-text">Click "Run System Tests" to test the backend API.</p>
        )}

        {!loading && hasRun && (
          <>
            <div className="stat-row">
              <div className="stat-block">
                <span className="stat-value">{totalTests}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-block">
                <span className="stat-value stat-success">{passedTests}</span>
                <span className="stat-label">Passed</span>
              </div>
              <div className="stat-block">
                <span className="stat-value stat-danger">{failedTests}</span>
                <span className="stat-label">Failed</span>
              </div>
            </div>

            <div className="test-result-grid">
              {results.map((result) => (
                <div
                  key={result.name}
                  className={`test-card ${result.passed ? 'test-card-pass' : 'test-card-fail'}`}
                >
                  <div className="test-card-header">
                    <span className="test-card-name">{result.name}</span>
                    <span className={`test-badge ${result.passed ? 'test-badge-pass' : 'test-badge-fail'}`}>
                      {result.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="test-card-explanation">{result.explanation}</p>
                  <span className="explanation-label">Result</span>
                  <p className="test-card-details">{result.details}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <h2 className="system-algorithms-heading">System Algorithms</h2>
      <div className="algorithm-explanation">
        <div>
          <h3>Hashing</h3>
          <p>
            Used for fast student profile lookup. The backend stores profiles in a Python
            dictionary keyed by student ID, giving average O(1) lookup instead of scanning a list.
          </p>
          <HashBenchmarkPanel />
        </div>
        <div>
          <h3>Weighted Career Scoring</h3>
          <p>Used to calculate career compatibility percentages.</p>
        </div>
        <div>
          <h3>BFS</h3>
          <p>Used to explore the career-skill graph level by level.</p>
        </div>
        <div>
          <h3>DFS</h3>
          <p>Used to explore the career-skill graph deeply before backtracking.</p>
        </div>
      </div>
    </section>
  )
}

export default SystemTesting
