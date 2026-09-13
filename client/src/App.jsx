import { useState } from "react"
import SearchBar from "./components/SearchBar.jsx"
import { getContributions, getProfile, getRepos } from "./services/backendService.js"
import repoStats from "./utils/repoStats.js"
import ProfileCard from "./components/ProfileCard.jsx"
import StatsGrid from "./components/StatsGrid.jsx"
import RepositoryList from "./components/RepositoryList.jsx"
import ContributionStats from "./components/ContributionStats.jsx"
import ActivityGraph from "./components/ActivityGraph.jsx"

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
  const [contributionCalendar, setContributionCalendar] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // Calculate the statistics on every render using the repos state
  const stats = repoStats(repos);

  async function getUserData(username) {
    try {
      setProfile("")
      setRepos([])
      setContributionStats(null)
      setContributionCalendar(null)
      setError("")
      setIsLoading(true)
      const [profileData, repoData, contributionsData] = await Promise.all([
        getProfile(username),
        getRepos(username),
        getContributions(username)
      ])

      setProfile(profileData)
      setRepos(repoData.repos)
      setContributionCalendar(contributionsData.contributionCalendar)
      setContributionStats(contributionsData.stats)
    } catch (error) {
      setError(getErrorMessage(error.status))
      setContributionCalendar(null)
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
      setContributionCalendar(null)
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
        <ProfileCard profile={profile} />
      }

      <br />

      {repos.length > 0 &&
        <StatsGrid stats={stats} />
      }

      <br />

      {repos.length > 0 &&
        <RepositoryList repos={repos} />
      }

      {contributionCalendar && contributionStats &&
        <ActivityGraph
          calendar={contributionCalendar}
          stats={contributionStats}
          isLoading={isLoading}
        />
      }
    </>
  )

}

export default App
