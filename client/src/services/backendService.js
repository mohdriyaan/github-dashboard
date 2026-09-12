const getContributions = async (username) => {
  try {
    const res = await fetch("/api/github/contributions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username })
    })

    if (!res.ok) {
      const errorData = await res.json()
      const error = new Error(errorData.error || "Unable to fetch contribution data")
      error.status = res.status
      throw error
    }

    const data = await res.json()

    return data
  } catch (error) {
    if(error.status===500){
      
    }
  }

}

export default getContributions