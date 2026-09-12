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

const getUser = async (username) => {
  const res = await fetch(`https://api.github.com/users/${username}`)

  if (!res.ok) {
    const errorData = await res.json()

    const error = new Error(
      errorData.message || "Unable to fetch GitHub user"
    )

    error.status = getGitHubErrorStatus(res)

    throw error
  }

  return res.json()
}

const getUserRepos = async (username) => {
  const allRepos = []
  let page = 1

  while (true) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?page=${page}&per_page=100`)

    if (!res.ok) {
      const errorData = await res.json()

      const error = new Error(
        errorData.message || "Unable to fetch GitHub repositories"
      )

      error.status = getGitHubErrorStatus(res)

      throw error
    }

    const repos = await res.json()

    allRepos.push(...repos)

    if (repos.length < 100) {
      break
    }

    page += 1
  }

  return allRepos
}

export { getUser, getUserRepos }