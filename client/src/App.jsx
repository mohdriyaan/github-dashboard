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
import LandingState from "./components/LandingState.jsx"

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

  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isReposLoading, setIsReposLoading] = useState(false)
  const [isContributionsLoading, setIsContributionsLoading] = useState(false)

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

  async function retryProfile() {
    if (!searchedUsername) return

    setProfileError("")
    setIsProfileLoading(true)

    try {
      const profileData = await getProfile(searchedUsername)
      setProfile(profileData)
    } catch (error) {
      setProfileError(
        getErrorMessage(error?.status)
      )
    } finally {
      setIsProfileLoading(false)
    }
  }

  async function retryContributions() {
    if (!searchedUsername) return

    setContributionsError("")
    setIsContributionsLoading(true)

    try {
      const contributionsData = await getContributions(
        searchedUsername
      )

      setContributionCalendar(
        contributionsData.contributionCalendar
      )

      setContributionStats(
        contributionsData.stats
      )
    } catch (error) {
      setContributionsError(
        getErrorMessage(error?.status)
      )
    } finally {
      setIsContributionsLoading(false)
    }
  }

  async function retryRepos() {
    if (!searchedUsername) return

    setReposError("")
    setIsReposLoading(true)

    try {
      const reposData = await getRepos(searchedUsername)
      setRepos(reposData.repos)
    } catch (error) {
      setReposError(
        getErrorMessage(error?.status)
      )
    } finally {
      setIsReposLoading(false)
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

          {/* Landing state — shown before the first search */}
          {!isLoading &&
            !profileError &&
            !profile && (
              <LandingState />
            )}

          {/* Loading state */}
          {isLoading && <DashboardSkeleton />}

          {/* Profile error */}
          {!isLoading &&
            profileError &&
            !profile && (
              <ErrorState
                title="Unable to load profile"
                description={profileError}
                actionLabel="Try again"
                onAction={retryProfile}
                isLoading={isProfileLoading}
              />
            )}

          {/* Profile */}
          {!isLoading && profile && (
            <ProfileCard profile={profile} />
          )}

          {/* Contribution activity */}
          {!isLoading && profile && (
            contributionsError ? (
              <ErrorState
                icon={Activity}
                title="Unable to load contributions"
                description={contributionsError}
                actionLabel="Try again"
                onAction={retryContributions}
                isLoading={isContributionsLoading}
              />
            ) : contributionCalendar &&
              contributionStats ? (
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

          {/* Repository stats */}
          {!isLoading &&
            profile &&
            !reposError &&
            repos.length > 0 && (
              <StatsGrid stats={stats} />
            )}

          {/* Repositories */}
          {!isLoading && profile && (
            reposError ? (
              <ErrorState
                title="Unable to load repositories"
                description={reposError}
                actionLabel="Try again"
                onAction={retryRepos}
                isLoading={isReposLoading}
              />
            ) : isReposLoading ? (
              <section
                aria-label="Loading repositories"
                className="border-y border-border py-6 sm:py-7"
              >
                <div className="space-y-6">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse border-b border-border pb-6 last:border-b-0 last:pb-0 sm:pb-7"
                    >
                      <div className="h-5 w-2/5 rounded bg-muted" />

                      <div className="mt-3 h-4 w-full max-w-2xl rounded bg-muted" />

                      <div className="mt-2 h-4 w-3/4 max-w-xl rounded bg-muted" />

                      <div className="mt-4 h-4 w-32 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </section>
            ) : repos.length > 0 ? (
              <RepositoryList repos={repos} />
            ) : (
              <EmptyState
                title="No repositories"
                description="This profile doesn't have any public repositories."
              />
            )
          )}
        </div>
      </main>
    </>
  )
}

export default App