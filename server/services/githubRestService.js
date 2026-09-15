import { profileCache, reposCache } from "../utils/ttlCache.js"

const normalizeUsername = (username) => username.trim().toLowerCase()

const getGitHubErrorStatus = (res) => {
  const remaining = res.headers.get("x-ratelimit-remaining")

  if (res.status === 429) {
    return 429
  }

  if (res.status === 403 && remaining === "0") {
    return 429
  }

  return res.status
}

const handleGitHubError = async (res, fallbackMessage) => {
  const errorData = await res.json()

  const error = new Error(
    errorData.message || fallbackMessage
  )

  error.status = getGitHubErrorStatus(res)

  throw error
}

const getUser = async (username) => {
  const key = normalizeUsername(username)
  const cachedUser = profileCache.get(key)

  if (cachedUser) {
    return cachedUser
  }

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(key)}`)

  if (!res.ok) {
    await handleGitHubError(res, "Unable to fetch GitHub user")
  }

  const user = await res.json()
  profileCache.set(key, user)

  return user
}

const getUserRepos = async (username) => {
  const key = normalizeUsername(username)
  const cachedRepos = reposCache.get(key)

  if (cachedRepos) {
    return cachedRepos
  }

  const allRepos = []
  let page = 1

  while (true) {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(key)}/repos?page=${page}&per_page=100`
    )

    if (!res.ok) {
      await handleGitHubError(res, "Unable to fetch GitHub repositories")
    }

    const repos = await res.json()
    allRepos.push(...repos)

    if (repos.length < 100) {
      break
    }

    page += 1
  }

  reposCache.set(key, allRepos)

  return allRepos
}

export { getUser, getUserRepos }
