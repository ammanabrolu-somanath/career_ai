/**
 * All communication with the Flask backend lives in this one file.
 * Every page imports functions from here instead of calling fetch()
 * directly, so there is exactly one place that knows the API's URLs
 * and response shape.
 */

const API_BASE_URL = 'http://127.0.0.1:5000/api'

/**
 * Shared request logic for every endpoint below.
 *
 * Design: the backend returns structured JSON ({success, errors, ...})
 * even for "expected" failures like invalid profiles (400) or an unknown
 * student ID (404) - those are not connectivity problems, they are
 * normal answers the calling page needs to render. So this function only
 * throws for genuine failures: the backend is unreachable, or it
 * returned something that isn't valid JSON at all (e.g. a raw 500 error
 * page). Anything with a parseable JSON body - success or failure - is
 * returned as-is for the caller to inspect via `data.success`.
 */
async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the career guidance server. Please make sure the backend is running.'
    )
  }

  let data
  try {
    data = await response.json()
  } catch (parseError) {
    throw new Error(`Server returned an unexpected response (status ${response.status}).`)
  }

  return data
}

function getJSON(path) {
  return request(path, { method: 'GET' })
}

function postJSON(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function getHealth() {
  return getJSON('/health')
}

export function validateProfile(profile) {
  return postJSON('/validate', profile)
}

export function getRecommendations(profile) {
  return postJSON('/recommend', profile)
}

export function getStudent(studentId) {
  return getJSON(`/student/${encodeURIComponent(studentId)}`)
}

export function getCareers() {
  return getJSON('/careers')
}

export function runBFS(node) {
  return getJSON(`/graph/bfs/${encodeURIComponent(node)}`)
}

export function runDFS(node) {
  return getJSON(`/graph/dfs/${encodeURIComponent(node)}`)
}
