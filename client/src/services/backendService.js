const getContributions = async (username) => {
  const res = await fetch("/api/github/contributions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username })
  })

  if (!res.ok) {
    const errorData = await res.json()
    const error = new Error(
      errorData.error || "Unable to fetch contribution data"
    )
    error.status = res.status
    throw error
  }

  return res.json()
}

const getProfile = async (username) => {
  const res = await fetch("/api/github/profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username })
  })

  if (!res.ok) {
    const errorData = await res.json()
    const error = new Error(
      errorData.error || "Unable to fetch user data"
    )
    error.status = res.status
    throw error
  }

  return res.json()
}

const getRepos = async (username) => {
  const res = await fetch("/api/github/repos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username })
  })

  if (!res.ok) {
    const errorData = await res.json()
    const error = new Error(
      errorData.error || "Unable to fetch repos data"
    )
    error.status = res.status
    throw error
  }

  return res.json()
}

const getComparisonProfileData = async (username) => {
  try {
    const profile = await getProfile(username)
    const [reposResult, contributionsResult] = await Promise.allSettled([
      getRepos(username),
      getContributions(username),
    ])

    return {
      username,
      profile,
      repos:
        reposResult.status === "fulfilled"
          ? reposResult.value.repos
          : [],
      stats:
        contributionsResult.status === "fulfilled"
          ? contributionsResult.value.stats
          : null,
      contributionCalendar:
        contributionsResult.status === "fulfilled"
          ? contributionsResult.value.contributionCalendar
          : null,
      reposError:
        reposResult.status === "rejected"
          ? reposResult.reason
          : null,
      contributionsError:
        contributionsResult.status === "rejected"
          ? contributionsResult.reason
          : null,
      profileError: null,
    }
  } catch (error) {
    return {
      username,
      profile: null,
      repos: [],
      stats: null,
      contributionCalendar: null,
      reposError: null,
      contributionsError: null,
      profileError: error,
    }
  }
}

export { getComparisonProfileData, getContributions, getProfile, getRepos }
