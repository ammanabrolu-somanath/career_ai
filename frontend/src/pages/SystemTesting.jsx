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

const TEST_FUNCTIONS = [
  testValidRecommendation,
  testTypoDetection,
  testEmptyProfileValidation,
  testInvalidStudentLookup,
  testBFS,
  testDFS,
]

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
          <p>Used for fast student profile lookup.</p>
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
