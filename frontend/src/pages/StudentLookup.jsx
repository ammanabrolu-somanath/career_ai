import { useState } from 'react'
import { getStudent } from '../services/api'

function StudentLookup() {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [networkError, setNetworkError] = useState('')
  const [result, setResult] = useState(null)
  const [lastSearchedId, setLastSearchedId] = useState('')

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
    </section>
  )
}

export default StudentLookup
