import { useState } from 'react'
import { getStudent, getHashingBenchmark } from '../services/api'

function formatMs(seconds) {
  return `${(seconds * 1000).toFixed(4)} ms`
}

function StudentLookup() {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [networkError, setNetworkError] = useState('')
  const [result, setResult] = useState(null)
  const [lastSearchedId, setLastSearchedId] = useState('')

  const [benchmarkLoading, setBenchmarkLoading] = useState(false)
  const [benchmarkError, setBenchmarkError] = useState('')
  const [benchmarkResults, setBenchmarkResults] = useState(null)

  const runBenchmark = async () => {
    setBenchmarkLoading(true)
    setBenchmarkError('')
    setBenchmarkResults(null)

    try {
      const data = await getHashingBenchmark()
      if (data.success) {
        setBenchmarkResults(data.results)
      } else {
        setBenchmarkError(data.error || 'Unable to run the hash lookup benchmark.')
      }
    } catch (error) {
      setBenchmarkError(error.message)
    } finally {
      setBenchmarkLoading(false)
    }
  }

  const handleSearch = async (event) => {
    event.preventDefault()

    const trimmedId = studentId.trim()
    if (!trimmedId) {
      setNetworkError('Please enter a Student ID before searching.')
      setResult(null)
      return
    }

    setLoading(true)
    setNetworkError('')
    setResult(null)
    setLastSearchedId(trimmedId)

    try {
      const data = await getStudent(trimmedId)
      setResult(data)
    } catch (error) {
      setNetworkError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="lookup-page">
      <h1>Student Lookup</h1>
      <p>Retrieve a stored student profile instantly by Student ID, using average O(1) hash-table lookup.</p>

      <form className="lookup-form" onSubmit={handleSearch}>
        <div className="lookup-field">
          <label htmlFor="studentIdInput" className="lookup-field-label">
            Student ID
          </label>
          <input
            id="studentIdInput"
            type="text"
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="e.g. STU001"
          />
          <span className="field-hint">Format: STU0XX — e.g. STU001</span>
        </div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      <div className="results-section">
        <h2>Student Details</h2>

        {loading && <p className="placeholder-text">Retrieving student profile...</p>}

        {!loading && networkError && (
          <div className="message-box error-box">
            <p>{networkError}</p>
          </div>
        )}

        {!loading && !networkError && !result && (
          <p className="placeholder-text">
            Enter a Student ID and click Search to see details here.
          </p>
        )}

        {!loading && !networkError && result && !result.success && (
          <div className="message-box warning-box">
            <p>No student was found for ID "{lastSearchedId}". Please check the ID and try again.</p>
          </div>
        )}

        {!loading && !networkError && result && result.success && (
          <div className="student-profile-card">
            <div className="student-profile-header">
              <div className="student-profile-identity">
                <h3 className="student-profile-name">{result.profile.name}</h3>
                <span className="student-profile-id">{result.profile.student_id}</span>
              </div>
              <div className="stat-block">
                <span className={`stat-value stat-lg${result.profile.academic_score !== null ? ' stat-primary' : ''}`}>
                  {result.profile.academic_score !== null ? result.profile.academic_score : '—'}
                </span>
                <span className="stat-label">Academic Score</span>
              </div>
            </div>

            <div className="skill-tag-group">
              <span className="skill-tag-group-label">Skills</span>
              {result.profile.skills.length > 0 ? (
                <div className="skill-tag-list">
                  {result.profile.skills.map((skill) => (
                    <span key={skill} className="skill-tag skill-tag-neutral">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="placeholder-text">No skills available.</p>
              )}
            </div>

            <div className="skill-tag-group">
              <span className="skill-tag-group-label">Interests</span>
              {result.profile.interests.length > 0 ? (
                <div className="skill-tag-list">
                  {result.profile.interests.map((interest) => (
                    <span key={interest} className="skill-tag skill-tag-interest">
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="placeholder-text">No interests available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <h2>Hash Lookup Performance</h2>
      <p>
        This experiment compares sequential search through a list with Python
        dictionary-based hash lookup, using synthetic student records generated only for this
        benchmark. These records are completely separate from the real STUDENTS profiles — the
        benchmark does not read, modify, or add anything to the real student data, and every
        stored profile is unaffected. The benchmark measures only the lookup operation.
      </p>

      <button type="button" className="secondary-button" onClick={runBenchmark} disabled={benchmarkLoading}>
        {benchmarkLoading ? (
          <>
            <span className="button-spinner" aria-hidden="true" />
            Running...
          </>
        ) : (
          'Run Hash Lookup Benchmark'
        )}
      </button>

      <div className="results-section">
        {benchmarkLoading && <p className="placeholder-text">Running the benchmark on the backend...</p>}

        {!benchmarkLoading && benchmarkError && (
          <div className="message-box error-box">
            <p>{benchmarkError}</p>
          </div>
        )}

        {!benchmarkLoading && !benchmarkError && !benchmarkResults && (
          <p className="placeholder-text">
            Click "Run Hash Lookup Benchmark" to measure real sequential-search-vs-hash-lookup
            timings from the backend.
          </p>
        )}

        {!benchmarkLoading && !benchmarkError && benchmarkResults && (
          <>
            <div className="hashing-benchmark-table-wrap">
              <table className="hashing-benchmark-table">
                <thead>
                  <tr>
                    <th>Dataset Size</th>
                    <th>Sequential Search</th>
                    <th>Hash Lookup</th>
                    <th>Records Examined</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.map((row) => (
                    <tr key={row.dataset_size}>
                      <td>{row.dataset_size.toLocaleString()}</td>
                      <td>{formatMs(row.sequential_average_time)}</td>
                      <td>{formatMs(row.hash_average_time)}</td>
                      <td>
                        {row.sequential_records_examined.toLocaleString()} (sequential) vs.{' '}
                        {row.hash_access_type} (hash)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="field-hint hashing-benchmark-note">
              Sequential search may examine many records because it scans the list. "Records
              Examined" is the number of records sequential search scanned before finding the
              target. Dictionary lookup uses the student ID as a hash key and accesses the
              corresponding entry directly. The theoretical average complexity of Python
              dictionary lookup is O(1), while sequential search is O(n). These timings are
              experimental measurements from the current machine and should not be presented as
              universal performance guarantees.
            </p>
          </>
        )}
      </div>
    </section>
  )
}

export default StudentLookup
