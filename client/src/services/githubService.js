const getUser = async (username) => {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`)

    if(!res.ok){
      const errorData = await res.json()
      const error = new Error(errorData.message || "An error occurred")
      error.status = res.status
      throw error
    }

    const data = await res.json()
    return data
  } catch (error) {
    throw error
  }
}

const getUserRepos = async(username) => {
  try {
        const res = await fetch(`https://api.github.com/users/${username}/repos`)

    if(!res.ok){
      const errorData = await res.json()
      const error = new Error(errorData.message || "An error occurred")
      error.status = res.status
      throw error
    }

    const data = await res.json()
    return data
  } catch (error) {
    throw error
  }
}

export {getUser, getUserRepos}



