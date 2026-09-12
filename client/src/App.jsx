import { useState } from "react"
import SearchBar from "./components/SearchBar.jsx"
import {getContributions, getProfile, getRepos} from "./services/backendService.js"
import repoStats from "./utils/repoStats.js"

const getErrorMessage = (status) => {
  if (status === 400) return "Username is required"
  if (status === 404) return "GitHub user not found"
  if (status === 401) return "GitHub authentication failed"
  if (status === 429) return "GitHub rate limit exceeded"
  if (status >= 500) return "Server error. Please try again"
  return "Something went wrong"
}

function App() {
  const [profile, setProfile] = useState("")
  const [result, setResult] = useState("")
  const [repos, setRepos] = useState([])
  const [contributionStats, setContributionStats] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // Calculate the statistics on every render using the repos state
  const stats = repoStats(repos);

  async function getUserData(username) {
    try {
      setProfile("")
      setRepos([])
      setContributionStats(null)
      setError("")
      setIsLoading(true)
      const [profileData, repoData, contributionsData] = await Promise.all([
        getProfile(username),
        getRepos(username),
        getContributions(username)
      ])

      setProfile(profileData)
      setRepos(repoData.repos)
      setContributionStats(contributionsData.stats)
    } catch (error) {
      setError(getErrorMessage(error.status))
      setProfile("")
      setRepos([])
      setContributionStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  function onSearch(username) {
    username = username.trim()

    if (!username) {
      setError("Username is required")
      setProfile("")
      setRepos([])
      setContributionStats(null)
      return
    }

    setResult(username)
    getUserData(username)
  }

  return (
    <>
      <h1 className="text-2xl font-bold p-5">Github Profile Finder</h1>
      <SearchBar onSearch={onSearch} isLoading={isLoading} />
      <p>Searched username : {result}</p>

      {isLoading && "Loading..."}

      {!profile && error}

      {profile &&
        <div>
          <h2>Profile</h2>
          <p>Username: {profile?.login} </p>
          <p>Name: {profile?.name}</p>
          <p>Followers: {profile?.followers}</p>
          <p>Public Repos: {profile?.public_repos}</p>
        </div>
      }

      <br />

      {repos.length > 0 &&
        <>
          <h2>Repository Statistics</h2>
          <p>Total Stars: {stats?.totalStars}</p>
          <p>Total Forks: {stats?.totalForks}</p>
          <p>Most Used Language: {stats?.mostUsedLanguage}</p>
        </>
      }

      <br />

      {repos.length > 0 &&
        <>
          <h2>Repositories</h2>
          {repos.map((repo) => {
            return (
              <div key={repo.id}>
                <p>Name: {repo?.name}</p>
                <p>Description: {repo?.description}</p>
                <p>Total Stars: {repo?.stargazers_count}</p>
                <p>Total Forks: {repo?.forks_count}</p>
                <p>Most used language: {repo?.language}</p>
                <br />
              </div>
            )
          })}
        </>
      }

      {contributionStats &&
        <>
          <h2>Contribution Statistics</h2>
          <p>Total Contributions: {contributionStats?.totalContributions}</p>
          <p>Current Streak: {contributionStats?.currentStreak}</p>
          <p>Longest Streak: {contributionStats?.longestStreak}</p>
        </>
      }
    </>
  )

}

export default App
