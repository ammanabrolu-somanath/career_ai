import { useState } from 'react'
import { getRecommendations } from '../services/api'

const INITIAL_FORM = {
  studentId: '',
  name: '',
  skills: '',
  interests: '',
  academicScore: '',
}

function parseCommaList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function buildProfile(formData) {
  const profile = {
    student_id: formData.studentId.trim(),
    name: formData.name.trim(),
    skills: parseCommaList(formData.skills),
    interests: parseCommaList(formData.interests),
  }

  if (formData.academicScore !== '') {
    profile.academic_score = Number(formData.academicScore)
  }

  return profile
}

function RecommendationCard({ career }) {
  const isTop = career.rank === 1

  return (
    <div className={`recommendation-card${isTop ? ' top-recommendation' : ''}`}>
      {isTop && <span className="best-match-badge">Best Match</span>}

      <div className="recommendation-header">
        <div className="recommendation-heading">
          <span className="recommendation-rank">#{career.rank}</span>
          <h3 className="recommendation-name">{career.career_name}</h3>
        </div>
        <div className="stat-block recommendation-score-block">
          <span className="stat-value stat-lg stat-success">{career.final_score_percentage}%</span>
          <span className="stat-label">Match Score</span>
        </div>
      </div>

      <div className="recommendation-metrics">
        <div className="recommendation-metric">
          <div className="recommendation-metric-label">
            <span>Skills Match</span>
            <span className="stat-pill stat-primary">{career.skill_score_percentage}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill progress-primary"
              style={{ width: `${career.skill_score_percentage}%` }}
            />
          </div>
        </div>

        <div className="recommendation-metric">
          <div className="recommendation-metric-label">
            <span>Interest Match</span>
            <span className="stat-pill stat-success">{career.interest_score_percentage}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill progress-success"
              style={{ width: `${career.interest_score_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {career.matched_skills.length > 0 && (
        <div className="skill-tag-group">
          <span className="skill-tag-group-label">Matched Skills</span>
          <div className="skill-tag-list">
            {career.matched_skills.map((skill) => (
              <span key={skill} className="skill-tag skill-tag-matched">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {career.missing_skills.length > 0 && (
        <div className="skill-tag-group">
          <span className="skill-tag-group-label">Missing Skills</span>
          <div className="skill-tag-list">
            {career.missing_skills.map((skill) => (
              <span key={skill} className="skill-tag skill-tag-missing">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {career.explanation && (
        <div className="explanation-box">
          <span className="explanation-label">Why this career?</span>
          <p className="recommendation-explanation">{career.explanation}</p>
        </div>
      )}
    </div>
  )
}

function Recommendation() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [networkError, setNetworkError] = useState('')
  const [result, setResult] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNetworkError('')
    setResult(null)

    try {
      const profile = buildProfile(formData)
      const data = await getRecommendations(profile)
      setResult(data)
    } catch (error) {
      setNetworkError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="recommendation-page">
      <h1>Career Recommendation</h1>
      <p>Enter your profile details below to receive ranked career recommendations.</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <label>
          Student ID
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="e.g. STU001"
          />
        </label>

        <label>
          Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </label>

        <label>
          Skills
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g. Python, SQL, Statistics"
          />
          <span className="field-hint">Separate multiple skills with commas.</span>
        </label>

        <label>
          Interests
          <input
            type="text"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="e.g. Data, Artificial Intelligence"
          />
          <span className="field-hint">Separate multiple interests with commas.</span>
        </label>

        <label>
          Academic Score
          <input
            type="number"
            name="academicScore"
            min="0"
            max="100"
            value={formData.academicScore}
            onChange={handleChange}
            placeholder="0-100"
          />
          <span className="field-hint">Optional — leave blank if not available.</span>
        </label>

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Analyzing...
            </>
          ) : (
            'Get Recommendations'
          )}
        </button>
      </form>

      <div className="results-section">
        <h2>Recommended Careers</h2>

        {loading && <p className="placeholder-text">Analyzing your profile...</p>}

        {!loading && networkError && (
          <div className="message-box error-box">
            <p>{networkError}</p>
          </div>
        )}

        {!loading && !networkError && !result && (
          <p className="placeholder-text">Submit the form above to see recommendations here.</p>
        )}

        {!loading && !networkError && result && (
          <>
            {result.errors && result.errors.length > 0 && (
              <div className="message-box error-box">
                <h3>Please fix the following</h3>
                <ul>
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="message-box warning-box">
                <h3>Warnings</h3>
                <ul>
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.suggestions && Object.keys(result.suggestions).length > 0 && (
              <div className="message-box suggestion-box">
                <h3>Did you mean?</h3>
                <ul>
                  {Object.entries(result.suggestions).map(([typed, suggested]) => (
                    <li key={typed}>
                      {typed} → {suggested}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.success && result.recommendations && result.recommendations.length > 0 && (
              <div className="recommendation-list">
                {result.recommendations.map((career) => (
                  <RecommendationCard key={career.career_name} career={career} />
                ))}
              </div>
            )}

            {result.success && result.recommendations && result.recommendations.length === 0 && (
              <p className="placeholder-text">
                No careers were directly connected to this profile's skills and interests.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default Recommendation
