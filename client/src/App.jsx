import { useState } from "react"

import {
  getContributions,
  getProfile,
  getRepos,
} from "./services/backendService.js"

import repoStats from "./utils/repoStats.js"

import ProfileCard from "./components/ProfileCard.jsx"
import StatsGrid from "./components/StatsGrid.jsx"
import RepositoryList from "./components/RepositoryList.jsx"
import ActivityGraph from "./components/ActivityGraph.jsx"
import DashboardHeader from "./components/DashboardHeader.jsx"

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
  const [repos, setRepos] = useState([])
  const [contributionStats, setContributionStats] = useState(null)
  const [contributionCalendar, setContributionCalendar] =
    useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const stats = repoStats(repos)

  async function getUserData(username) {
    try {
      setProfile("")
      setRepos([])
      setContributionStats(null)
      setContributionCalendar(null)
      setError("")
      setIsLoading(true)

      const [
        profileData,
        repoData,
        contributionsData,
      ] = await Promise.all([
        getProfile(username),
        getRepos(username),
        getContributions(username),
      ])

      setProfile(profileData)
      setRepos(repoData.repos)
      setContributionCalendar(
        contributionsData.contributionCalendar
      )
      setContributionStats(contributionsData.stats)
    } catch (error) {
      setError(getErrorMessage(error.status))
      setProfile("")
      setRepos([])
      setContributionStats(null)
      setContributionCalendar(null)
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

    getUserData(username)
  }

  return (
    <>
      <DashboardHeader
        onSearch={onSearch}
        isLoading={isLoading}
      />

      <main className="mx-auto w-full max-w-[1440px] px-6 py-10">
        <div className="space-y-14">
          {isLoading && (
            <p className="text-sm text-muted-foreground">
              Loading...
            </p>
          )}

          {!profile && error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {profile && (
            <ProfileCard profile={profile} />
          )}

          {repos.length > 0 && (
            <StatsGrid stats={stats} />
          )}

          {repos.length > 0 && (
            <RepositoryList repos={repos} />
          )}

          {contributionCalendar && contributionStats && (
            <ActivityGraph
              calendar={contributionCalendar}
              stats={contributionStats}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </>
  )
}

export default App