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


export {getContributions, getProfile, getRepos}