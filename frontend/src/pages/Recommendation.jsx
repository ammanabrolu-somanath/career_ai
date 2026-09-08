import { useEffect, useMemo, useState } from 'react'
import { getCareers, getRecommendations } from '../services/api'

const INITIAL_FORM = {
  studentId: '',
  name: '',
  skills: [],
  interests: [],
  academicScore: '',
}

// Splits on commas so pasting "Python, SQL, Statistics" (or hitting Enter
// after a single word) both work the same way, then de-dupes case-
// insensitively against whatever the field already holds.
function addChipValues(existing, rawInput) {
  const incoming = rawInput
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  const next = [...existing]
  for (const value of incoming) {
    const alreadyPresent = next.some((item) => item.toLowerCase() === value.toLowerCase())
    if (!alreadyPresent) next.push(value)
  }
  return next
}

function buildProfile(formData) {
  const profile = {
    student_id: formData.studentId.trim(),
    name: formData.name.trim(),
    skills: formData.skills,
    interests: formData.interests,
  }

  if (formData.academicScore !== '') {
    profile.academic_score = Number(formData.academicScore)
  }

  return profile
}

// Client-side checks mirror only the backend's blocking rules (validation.py)
// so obvious mistakes (empty student ID, no skills at all) are caught
// before a network round trip - never a stand-in for the backend's own
// vocabulary/typo checks, which still run server-side and are rendered
// from the response exactly as before.
function getClientErrors(formData) {
  const errors = []
  if (!formData.studentId.trim()) {
    errors.push('Student ID is required.')
  }
  if (formData.skills.length === 0) {
    errors.push('Add at least one skill.')
  }
  if (formData.interests.length === 0) {
    errors.push('Add at least one interest.')
  }
  if (formData.academicScore !== '') {
    const score = Number(formData.academicScore)
    if (Number.isNaN(score) || score < 0 || score > 100) {
      errors.push('Academic score must be a number between 0 and 100.')
    }
  }
  return errors
}

function toPercent(fraction) {
  if (fraction === null || fraction === undefined) return null
  return Math.round(fraction * 1000) / 10
}

// A labeled text field that turns entries into removable chips instead of
// a raw comma-separated string. Free text is still accepted (not limited
// to `suggestions`) so the backend's typo-suggestion and contradictory-
// preference flows stay reachable - `suggestions` is purely a convenience
// shortlist sourced from the real backend vocabulary (via /api/careers),
// not a new constraint.
function ChipInput({ id, values, onChange, suggestions, placeholder, ariaLabel }) {
  const [inputValue, setInputValue] = useState('')

  const commitInput = () => {
    if (!inputValue.trim()) return
    onChange(addChipValues(values, inputValue))
    setInputValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commitInput()
    } else if (event.key === 'Backspace' && inputValue === '' && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  const removeChip = (value) => {
    onChange(values.filter((item) => item !== value))
  }

  const addSuggestion = (value) => {
    if (values.some((item) => item.toLowerCase() === value.toLowerCase())) return
    onChange([...values, value])
  }

  const availableSuggestions = suggestions.filter(
    (item) => !values.some((value) => value.toLowerCase() === item.toLowerCase())
  )

  return (
    <div className="chip-input">
      <div className="chip-input-field">
        {values.map((value) => (
          <span key={value} className="chip">
            {value}
            <button
              type="button"
              className="chip-remove"
              onClick={() => removeChip(value)}
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitInput}
          placeholder={values.length === 0 ? placeholder : 'Add another…'}
          aria-label={ariaLabel}
          className="chip-input-text"
        />
      </div>

      {availableSuggestions.length > 0 && (
        <div className="chip-suggestions">
          {availableSuggestions.slice(0, 12).map((value) => (
            <button
              key={value}
              type="button"
              className="chip-suggestion"
              onClick={() => addSuggestion(value)}
            >
              + {value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RecommendationCard({ career }) {
  const isTop = career.rank === 1
  const weights = career.weights_used || null
  const academicProvided = weights ? weights.academic_score_provided === true : false
  const academicPercent = toPercent(career.academic_component)
  const skillWeightPercent = weights ? toPercent(weights.skill_weight) : null
  const interestWeightPercent = weights ? toPercent(weights.interest_weight) : null
  const academicWeightPercent = weights ? toPercent(weights.academic_weight) : null
  const matchedInterests = career.matched_interests || []
  const missingInterests = career.missing_interests || []

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

      {matchedInterests.length > 0 && (
        <div className="skill-tag-group">
          <span className="skill-tag-group-label">Matched Interests</span>
          <div className="skill-tag-list">
            {matchedInterests.map((interest) => (
              <span key={interest} className="skill-tag skill-tag-interest">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingInterests.length > 0 && (
        <div className="skill-tag-group">
          <span className="skill-tag-group-label">Missing Interests</span>
          <div className="skill-tag-list">
            {missingInterests.map((interest) => (
              <span key={interest} className="skill-tag skill-tag-missing">
                {interest}
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

      <details className="score-details">
        <summary>How this score was calculated</summary>

        {!weights ? (
          <p className="field-hint score-details-fallback">
            Detailed scoring breakdown is unavailable for this recommendation.
          </p>
        ) : (
          <div className="score-details-body">
            {academicProvided ? (
              <div className="recommendation-metric">
                <div className="recommendation-metric-label">
                  <span>Academic Contribution</span>
                  <span className="stat-pill stat-warning">
                    {academicPercent === null ? '—' : `${academicPercent}%`}
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill progress-warning"
                    style={{ width: `${academicPercent === null ? 0 : academicPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="field-hint academic-note">
                Academic score not provided — weight redistributed to Skills and Interests.
              </p>
            )}

            <p className="score-formula">
              Skills ({skillWeightPercent === null ? '—' : `${skillWeightPercent}%`}) + Interests (
              {interestWeightPercent === null ? '—' : `${interestWeightPercent}%`})
              {academicProvided &&
                ` + Academic (${academicWeightPercent === null ? '—' : `${academicWeightPercent}%`})`}
            </p>

            {!academicProvided && (
              <p className="field-hint">
                Academic score was not provided, so its weight was redistributed proportionally
                between Skills and Interests.
              </p>
            )}
          </div>
        )}
      </details>
    </div>
  )
}

function Recommendation() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [networkError, setNetworkError] = useState('')
  const [result, setResult] = useState(null)
  const [clientErrors, setClientErrors] = useState([])
  const [studentIdTouched, setStudentIdTouched] = useState(false)
  const [careers, setCareers] = useState([])

  // Sourced from the real backend vocabulary (the same CAREERS data
  // validation.py derives ALL_SKILLS/ALL_INTERESTS from) so the suggestion
  // chips can never drift out of sync with what the server actually
  // recognizes. Silently ignored on failure - suggestions are a
  // convenience, not a requirement for the form to work.
  useEffect(() => {
    let cancelled = false
    getCareers()
      .then((data) => {
        if (!cancelled && data.success) setCareers(data.careers)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const allSkills = useMemo(() => {
    const set = new Set()
    careers.forEach((career) => (career.required_skills || []).forEach((skill) => set.add(skill)))
    return [...set].sort()
  }, [careers])

  const allInterests = useMemo(() => {
    const set = new Set()
    careers.forEach((career) => (career.related_interests || []).forEach((interest) => set.add(interest)))
    return [...set].sort()
  }, [careers])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (loading) return // guards against a double-fire from fast repeat clicks/Enter

    setStudentIdTouched(true)
    const errors = getClientErrors(formData)
    setClientErrors(errors)
    if (errors.length > 0) return

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

  const showStudentIdError = studentIdTouched && !formData.studentId.trim()

  return (
    <section className="recommendation-page">
      <div className="assessment-intro">
        <span className="stat-pill stat-primary">Career Assessment</span>
        <h1>Discover Your Career Path</h1>
        <p className="assessment-intro-description">
          Tell us about your skills, interests, and academic strengths. Our intelligent
          recommendation system will analyze your inputs and suggest suitable career paths.
        </p>
      </div>

      <form className="assessment-form" onSubmit={handleSubmit} noValidate>
        <div className="assessment-section">
          <h2 className="assessment-section-title">Your Details</h2>
          <p className="assessment-section-description">
            Used to identify your submission and personalize your results.
          </p>

          <div className="assessment-field-row">
            <label className="assessment-field">
              <span className="assessment-field-label">
                Student ID <span className="required-marker">*</span>
              </span>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                onBlur={() => setStudentIdTouched(true)}
                placeholder="e.g. STU001"
                aria-invalid={showStudentIdError}
                aria-describedby={showStudentIdError ? 'student-id-error' : undefined}
                className={showStudentIdError ? 'input-invalid' : ''}
              />
              {showStudentIdError && (
                <span id="student-id-error" className="field-error">
                  Student ID is required.
                </span>
              )}
            </label>

            <label className="assessment-field">
              <span className="assessment-field-label">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name (optional)"
              />
            </label>
          </div>
        </div>

        <div className="assessment-section">
          <h2 className="assessment-section-title">Your Skills</h2>
          <p className="assessment-section-description">
            Add at least one skill. Type a skill and press Enter, or pick one below — misspelled
            entries are still accepted and the system will suggest a correction.
          </p>
          <ChipInput
            id="skills-input"
            values={formData.skills}
            onChange={(skills) => setFormData((prev) => ({ ...prev, skills }))}
            suggestions={allSkills}
            placeholder="e.g. Python, SQL, Statistics"
            ariaLabel="Add a skill"
          />
        </div>

        <div className="assessment-section">
          <h2 className="assessment-section-title">Your Interests</h2>
          <p className="assessment-section-description">
            Add at least one interest area. You can select more than one.
          </p>
          <ChipInput
            id="interests-input"
            values={formData.interests}
            onChange={(interests) => setFormData((prev) => ({ ...prev, interests }))}
            suggestions={allInterests}
            placeholder="e.g. Data, Artificial Intelligence"
            ariaLabel="Add an interest"
          />
        </div>

        <div className="assessment-section">
          <h2 className="assessment-section-title">Academic Performance</h2>
          <p className="assessment-section-description">
            Optional. If provided, it contributes to your match score alongside skills and
            interests.
          </p>
          <label className="assessment-field assessment-field-narrow">
            <span className="assessment-field-label">Academic Score (0–100)</span>
            <input
              type="number"
              name="academicScore"
              min="0"
              max="100"
              value={formData.academicScore}
              onChange={handleChange}
              placeholder="0-100"
            />
            <span className="field-hint">Leave blank if not available.</span>
          </label>
        </div>

        {clientErrors.length > 0 && (
          <div className="message-box error-box" role="alert">
            <h3>Please fix the following</h3>
            <ul>
              {clientErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <button type="submit" className="primary-button assessment-submit" disabled={loading} aria-busy={loading}>
          {loading ? (
            <>
              <span className="button-spinner" aria-hidden="true" />
              Analyzing...
            </>
          ) : (
            'Get My Career Recommendations'
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
