import { useEffect, useState } from 'react'
import { getCareers } from '../services/api'

function TagList({ items, sharedSet, colorClass }) {
  return (
    <div className="skill-tag-list">
      {items.map((item) => (
        <span
          key={item}
          className={`skill-tag ${colorClass}${sharedSet.has(item) ? ' skill-tag-shared' : ''}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function CareerComparison() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [careerAName, setCareerAName] = useState('')
  const [careerBName, setCareerBName] = useState('')

  const fetchCareers = () => {
    setLoading(true)
    setError('')

    getCareers()
      .then((data) => {
        if (data.success) {
          setCareers(data.careers)
        } else {
          setError(data.error || 'Unable to load careers.')
        }
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchCareers()
  }, [])

  const careerA = careers.find((career) => career.name === careerAName) || null
  const careerB = careers.find((career) => career.name === careerBName) || null

  const handleCareerAChange = (event) => {
    setCareerAName(event.target.value)
  }

  const handleCareerBChange = (event) => {
    setCareerBName(event.target.value)
  }

  // Shared items are computed purely from the two careers' real arrays -
  // no score, percentage, or ranking is invented anywhere here.
  const sharedSkills = new Set(
    careerA && careerB
      ? careerA.required_skills.filter((skill) => careerB.required_skills.includes(skill))
      : []
  )
  const sharedInterests = new Set(
    careerA && careerB
      ? careerA.related_interests.filter((interest) => careerB.related_interests.includes(interest))
      : []
  )

  return (
    <section className="career-comparison-page">
      <h1>Compare Careers</h1>
      <p>Select two different careers to compare their requirements side by side.</p>

      {loading && <p className="placeholder-text">Loading careers...</p>}

      {!loading && error && (
        <div className="career-error">
          <div className="message-box error-box">
            <p>{error}</p>
          </div>
          <button type="button" className="secondary-button" onClick={fetchCareers}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && careers.length < 2 && (
        <p className="placeholder-text">
          At least two careers are needed to run a comparison.
        </p>
      )}

      {!loading && !error && careers.length >= 2 && (
        <>
          <div className="comparison-selectors">
            <label>
              Select Career 1
              <select value={careerAName} onChange={handleCareerAChange}>
                <option value="">-- Choose a career --</option>
                {careers.map((career) => (
                  <option key={career.name} value={career.name}>
                    {career.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select Career 2
              <select value={careerBName} onChange={handleCareerBChange}>
                <option value="">-- Choose a career --</option>
                {careers.map((career) => (
                  <option key={career.name} value={career.name}>
                    {career.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <span className="field-hint">Choose any two different careers to compare.</span>

          {careerAName && careerBName && careerAName === careerBName && (
            <div className="message-box warning-box">
              <p>Please select two different careers to compare.</p>
            </div>
          )}

          {careerA && careerB && careerAName !== careerBName && (
            <div className="results-section">
              <div className="comparison-table">
                <div className="comparison-row comparison-header-row">
                  <div className="comparison-label"></div>
                  <div className="comparison-value">
                    <span className="comparison-career-badge comparison-career-badge-a">A</span>
                    {careerA.name}
                  </div>
                  <div className="comparison-value">
                    <span className="comparison-career-badge comparison-career-badge-b">B</span>
                    {careerB.name}
                  </div>
                </div>

                <div className="comparison-row">
                  <div className="comparison-label">Description</div>
                  <div className="comparison-value">{careerA.description}</div>
                  <div className="comparison-value">{careerB.description}</div>
                </div>

                <div className="comparison-row">
                  <div className="comparison-label">Required Skills</div>
                  <div className="comparison-value">
                    <TagList items={careerA.required_skills} sharedSet={sharedSkills} colorClass="skill-tag-neutral" />
                  </div>
                  <div className="comparison-value">
                    <TagList items={careerB.required_skills} sharedSet={sharedSkills} colorClass="skill-tag-neutral" />
                  </div>
                </div>

                <div className="comparison-row">
                  <div className="comparison-label">Related Interests</div>
                  <div className="comparison-value">
                    <TagList items={careerA.related_interests} sharedSet={sharedInterests} colorClass="skill-tag-interest" />
                  </div>
                  <div className="comparison-value">
                    <TagList items={careerB.related_interests} sharedSet={sharedInterests} colorClass="skill-tag-interest" />
                  </div>
                </div>
              </div>

              {(sharedSkills.size > 0 || sharedInterests.size > 0) && (
                <p className="comparison-shared-summary">
                  <span className="skill-tag-shared-swatch" aria-hidden="true" /> Outlined tags are shared
                  between both careers — {sharedSkills.size} shared skill
                  {sharedSkills.size !== 1 ? 's' : ''}, {sharedInterests.size} shared interest
                  {sharedInterests.size !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CareerComparison
