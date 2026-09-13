import { useState } from "react"
import { Activity } from "lucide-react"

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
import DashboardSkeleton from "./components/DashboardSkeleton.jsx"
import EmptyState from "./components/EmptyState.jsx"
import ErrorState from "./components/ErrorState.jsx"

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
  const [contributionCalendar, setContributionCalendar] = useState(null)

  const [searchedUsername, setSearchedUsername] = useState("")

  const [profileError, setProfileError] = useState("")
  const [reposError, setReposError] = useState("")
  const [contributionsError, setContributionsError] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  const stats = repoStats(repos)

  async function getUserData(username) {
    setProfile("")
    setRepos([])
    setContributionStats(null)
    setContributionCalendar(null)

    setProfileError("")
    setReposError("")
    setContributionsError("")

    setIsLoading(true)

    try {
      const results = await Promise.allSettled([
        getProfile(username),
        getRepos(username),
        getContributions(username),
      ])

      const [
        profileResult,
        reposResult,
        contributionsResult,
      ] = results

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value)
      } else {
        setProfileError(
          getErrorMessage(profileResult.reason?.status)
        )
      }

      if (reposResult.status === "fulfilled") {
        setRepos(reposResult.value.repos)
      } else {
        setReposError(
          getErrorMessage(reposResult.reason?.status)
        )
      }

      if (contributionsResult.status === "fulfilled") {
        setContributionCalendar(
          contributionsResult.value.contributionCalendar
        )

        setContributionStats(
          contributionsResult.value.stats
        )
      } else {
        setContributionsError(
          getErrorMessage(
            contributionsResult.reason?.status
          )
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  function onSearch(username) {
    username = username.trim()

    if (!username) {
      setProfile("")
      setRepos([])
      setContributionStats(null)
      setContributionCalendar(null)

      setSearchedUsername("")

      setProfileError("Username is required")
      setReposError("")
      setContributionsError("")

      return
    }

    setSearchedUsername(username)
    getUserData(username)
  }

  function retrySearch() {
    if (!searchedUsername) return

    getUserData(searchedUsername)
  }

  return (
    <>
      <DashboardHeader
        onSearch={onSearch}
        isLoading={isLoading}
      />

      <main className="mx-auto w-full max-w-[1440px] px-6 py-10">
        <div className="space-y-14">
          {isLoading && <DashboardSkeleton />}

          {!isLoading && profileError && !profile && (
            <ErrorState
              title="Unable to load profile"
              description={profileError}
              actionLabel="Try again"
              onAction={retrySearch}
            />
          )}

          {!isLoading && profile && (
            <ProfileCard profile={profile} />
          )}

          {!isLoading &&
            profile &&
            !reposError &&
            repos.length > 0 && (
              <StatsGrid stats={stats} />
            )}

          {!isLoading && profile && (
            reposError ? (
              <ErrorState
                title="Unable to load repositories"
                description="Repositories could not be loaded for this profile."
                actionLabel="Try again"
                onAction={retrySearch}
              />
            ) : repos.length > 0 ? (
              <RepositoryList repos={repos} />
            ) : (
              <EmptyState
                title="No repositories"
                description="This profile doesn't have any public repositories."
              />
            )
          )}

          {!isLoading && profile && (
            contributionsError ? (
              <ErrorState
                icon={Activity}
                title="Unable to load contributions"
                description="Contribution activity could not be loaded for this profile."
                actionLabel="Try again"
                onAction={retrySearch}
              />
            ) : contributionCalendar && contributionStats ? (
              <ActivityGraph
                calendar={contributionCalendar}
                stats={contributionStats}
                isLoading={false}
              />
            ) : (
              <EmptyState
                icon={Activity}
                title="No contribution activity"
                description="There is no contribution activity available for this profile."
              />
            )
          )}
        </div>
      </main>
    </>
  )
}

export default App