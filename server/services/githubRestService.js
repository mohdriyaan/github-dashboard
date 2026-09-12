const getUser = async (username) => {
  const res = await fetch(`https://api.github.com/users/${username}`)

  if (!res.ok) {
    const errorData = await res.json()

    const error = new Error(
      errorData.message || "Unable to fetch GitHub user"
    )

    error.status = res.status

    throw error
  }

  return res.json()
}

const getUserRepos = async (username) => {
  const res = await fetch(`https://api.github.com/users/${username}/repos`)

  if (!res.ok) {
    const errorData = await res.json()

    const error = new Error(
      errorData.message || "Unable to fetch GitHub repositories"
    )

    error.status = res.status

    throw error
  }

  return await res.json()
}

export { getUser, getUserRepos }