const getErrorMessage = (status) => {
  if (status === 400) return "Username is required"
  if (status === 404) return "GitHub user not found"
  if (status === 401) return "GitHub authentication failed"
  if (status === 429) return "GitHub rate limit exceeded"
  if (status >= 500) return "Server error. Please try again"

  return "Something went wrong"
}

export default getErrorMessage
