import { useEffect, useState } from 'react'
import { getCareers } from '../services/api'

function CareerExplorer() {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [skillSearch, setSkillSearch] = useState('')

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

  const normalizedNameSearch = nameSearch.trim().toLowerCase()
  const normalizedSkillSearch = skillSearch.trim().toLowerCase()

  const filteredCareers = careers.filter((career) => {
    const matchesName = normalizedNameSearch
      ? career.name.toLowerCase().includes(normalizedNameSearch)
      : true

    const matchesSkill = normalizedSkillSearch
      ? career.required_skills.some((skill) =>
          skill.toLowerCase().includes(normalizedSkillSearch)
        )
      : true

    return matchesName && matchesSkill
  })

  return (
    <section className="career-explorer-page">
      <h1>Career Explorer</h1>
      <p>Browse every career in the system, or search by name or required skill.</p>

      <div className="career-search-controls">
        <div className="search-field">
          <label htmlFor="careerNameSearch" className="search-field-label">
            Career Name
          </label>
          <input
            id="careerNameSearch"
            type="text"
            value={nameSearch}
            onChange={(event) => setNameSearch(event.target.value)}
            placeholder="Search careers..."
          />
        </div>
        <div className="search-field">
          <label htmlFor="careerSkillSearch" className="search-field-label">
            Required Skill
          </label>
          <input
            id="careerSkillSearch"
            type="text"
            value={skillSearch}
            onChange={(event) => setSkillSearch(event.target.value)}
            placeholder="e.g. Python"
          />
        </div>
      </div>
      <span className="field-hint">
        {careers.length > 0
          ? `Showing ${filteredCareers.length} of ${careers.length} careers.`
          : 'Both filters can be used together.'}
      </span>

      <div className="results-section">
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

        {!loading && !error && careers.length > 0 && filteredCareers.length === 0 && (
          <p className="placeholder-text">No careers found.</p>
        )}

        {!loading && !error && filteredCareers.length > 0 && (
          <div className="career-grid">
            {filteredCareers.map((career) => (
              <div key={career.name} className="career-card">
                <div className="career-card-header">
                  <h3 className="career-name">{career.name}</h3>
                  <span className="stat-pill stat-primary">
                    {career.required_skills.length} skills
                  </span>
                </div>

                {career.description && (
                  <p className="career-description">{career.description}</p>
                )}

                <div className="skill-tag-group">
                  <span className="skill-tag-group-label">Required Skills</span>
                  <div className="skill-tag-list">
                    {career.required_skills.map((skill) => (
                      <span key={skill} className="skill-tag skill-tag-neutral">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="skill-tag-group">
                  <span className="skill-tag-group-label">Related Interests</span>
                  <div className="skill-tag-list">
                    {career.related_interests.map((interest) => (
                      <span key={interest} className="skill-tag skill-tag-interest">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default CareerExplorer
