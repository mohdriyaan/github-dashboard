import { useEffect, useRef, useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { getComparisonProfileData } from "../services/backendService.js"
import repoStats from "../utils/repoStats.js"
import getErrorMessage from "../utils/githubErrors.js"

const PROFILE_LABELS = ["Profile A", "Profile B"]

const formatNumber = (value) => {
  const number = Number(value)

  return new Intl.NumberFormat("en").format(
    Number.isFinite(number) ? number : 0
  )
}

const getInitials = (name, username) => {
  const value = name || username || ""

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const createLoadingResult = (username) => ({
  username,
  isLoading: true,
  profile: null,
  profileError: null,
  repos: [],
  reposError: null,
  stats: null,
  contributionsError: null,
})

const Metric = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-t border-border py-3 first:border-t-0 first:pt-0">
    <dt className="text-sm text-muted-foreground">{label}</dt>
    <dd className="font-mono text-sm font-semibold tabular-nums">{value}</dd>
  </div>
)

const ComparisonSkeleton = ({ label }) => (
  <section aria-label={`Loading ${label}`} className="space-y-6 p-5 sm:p-7">
    <div className="flex items-center gap-4">
      <div className="size-16 animate-pulse rounded-full bg-muted" />
      <div className="space-y-2">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    </div>
    <div className="h-10 w-full animate-pulse rounded bg-muted" />
    <div className="space-y-3 border-t border-border pt-5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-4 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  </section>
)

const ComparisonError = ({ label, username, error, onRetry }) => (
  <section className="flex min-h-72 flex-col justify-center p-5 sm:p-7">
    <p className="text-sm text-muted-foreground">{label}</p>
    <h3 className="mt-2 text-xl font-semibold tracking-tight">
      @{username}
    </h3>
    <p className="mt-3 text-sm leading-6 text-destructive">
      {getErrorMessage(error?.status)}
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRetry}
      className="mt-5 w-fit"
    >
      Retry this profile
    </Button>
  </section>
)

const ComparisonColumn = ({ label, result, onRetry }) => {
  if (result?.isLoading) return <ComparisonSkeleton label={label} />
  if (result?.profileError) {
    return (
      <ComparisonError
        label={label}
        username={result.username}
        error={result.profileError}
        onRetry={onRetry}
      />
    )
  }
  if (!result?.profile) return null

  const { profile } = result
  const repositoryStats = repoStats(result.repos)
  const hasRepositoryData = !result.reposError
  const hasPartialError = result.reposError || result.contributionsError
  const initials = getInitials(profile.name, profile.login)

  return (
    <section aria-labelledby={`${label.toLowerCase().replace(" ", "-")}-heading`} className="p-5 sm:p-7">
      <p className="text-sm text-muted-foreground">{label}</p>

      <div className="mt-4 flex min-w-0 items-start gap-4">
        <Avatar className="size-16 shrink-0 border border-border">
          <AvatarImage src={profile.avatar_url} alt={`${profile.login} avatar`} />
          <AvatarFallback className="font-mono text-base">{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3 id={`${label.toLowerCase().replace(" ", "-")}-heading`} className="truncate text-xl font-semibold tracking-tight">
            {profile.name || profile.login}
          </h3>
          <a
            href={profile.html_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm font-mono text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            @{profile.login}
          </a>
        </div>
      </div>

      {profile.bio && (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {profile.bio}
        </p>
      )}

      <dl className="mt-6">
        <Metric label="Followers" value={formatNumber(profile.followers)} />
        <Metric label="Following" value={formatNumber(profile.following)} />
        <Metric label="Public repositories" value={formatNumber(profile.public_repos)} />
      </dl>

      <section className="mt-7 border-t border-border pt-5" aria-labelledby={`${label.toLowerCase().replace(" ", "-")}-repository-heading`}>
        <h4 id={`${label.toLowerCase().replace(" ", "-")}-repository-heading`} className="text-sm font-semibold">
          Repository & community
        </h4>
        <dl className="mt-4">
          <Metric label="Total stars" value={hasRepositoryData ? formatNumber(repositoryStats.totalStars) : "Unavailable"} />
          <Metric label="Total forks" value={hasRepositoryData ? formatNumber(repositoryStats.totalForks) : "Unavailable"} />
          <Metric label="Most-used language" value={hasRepositoryData ? repositoryStats.mostUsedLanguage || "Not specified" : "Unavailable"} />
        </dl>
      </section>

      <section className="mt-7 border-t border-border pt-5" aria-labelledby={`${label.toLowerCase().replace(" ", "-")}-activity-heading`}>
        <h4 id={`${label.toLowerCase().replace(" ", "-")}-activity-heading`} className="text-sm font-semibold">
          Activity
        </h4>
        <dl className="mt-4">
          <Metric label="Contributions" value={result.stats ? formatNumber(result.stats.totalContributions) : "Unavailable"} />
          <Metric label="Current streak" value={result.stats ? `${formatNumber(result.stats.currentStreak)} days` : "Unavailable"} />
          <Metric label="Longest streak" value={result.stats ? `${formatNumber(result.stats.longestStreak)} days` : "Unavailable"} />
        </dl>
      </section>

      {hasPartialError && (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Some comparison data is unavailable.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            Retry this profile
          </Button>
        </div>
      )}
    </section>
  )
}

const CompareProfiles = () => {
  const [firstUsername, setFirstUsername] = useState("")
  const [secondUsername, setSecondUsername] = useState("")
  const [results, setResults] = useState([null, null])
  const [formError, setFormError] = useState("")
  const requestIdsRef = useRef([0, 0])

  useEffect(() => () => {
    requestIdsRef.current = requestIdsRef.current.map((requestId) => requestId + 1)
  }, [])

  const loadProfile = async (index, username) => {
    const requestId = ++requestIdsRef.current[index]

    setResults((current) => {
      const next = [...current]
      next[index] = createLoadingResult(username)
      return next
    })

    const result = await getComparisonProfileData(username)

    if (requestIdsRef.current[index] !== requestId) return

    setResults((current) => {
      const next = [...current]
      next[index] = { ...result, isLoading: false }
      return next
    })
  }

  const submitComparison = (event) => {
    event.preventDefault()

    const first = firstUsername.trim()
    const second = secondUsername.trim()

    if (!first || !second) {
      setFormError("Enter both GitHub usernames to compare profiles.")
      return
    }

    setFormError("")
    void loadProfile(0, first)
    void loadProfile(1, second)
  }

  const hasResults = results.some(Boolean)

  return (
    <section aria-labelledby="compare-profiles-heading" className="space-y-8">
      <div className="max-w-2xl space-y-2">
        <h2 id="compare-profiles-heading" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Compare profiles
        </h2>
        <p className="text-base leading-6 text-muted-foreground">
          Compare public profile, repository, and contribution activity side by side.
        </p>
      </div>

      <form onSubmit={submitComparison} className="border-y border-border py-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="compare-username-a" className="text-sm font-medium">
              GitHub username A
            </label>
            <Input
              id="compare-username-a"
              name="compare-username-a"
              value={firstUsername}
              onChange={(event) => setFirstUsername(event.target.value)}
              placeholder="octocat"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="compare-username-b" className="text-sm font-medium">
              GitHub username B
            </label>
            <Input
              id="compare-username-b"
              name="compare-username-b"
              value={secondUsername}
              onChange={(event) => setSecondUsername(event.target.value)}
              placeholder="hubot"
              autoComplete="off"
            />
          </div>

          <Button type="submit" className="w-full lg:w-auto">
            Compare
          </Button>
        </div>

        {formError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {formError}
          </p>
        )}
      </form>

      {!hasResults ? (
        <div className="border-y border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Enter two usernames to begin a comparison.
          </p>
        </div>
      ) : (
        <div className="grid border-y border-border md:grid-cols-2 md:divide-x md:divide-border">
          {PROFILE_LABELS.map((label, index) => (
            <ComparisonColumn
              key={label}
              label={label}
              result={results[index]}
              onRetry={() => {
                const username = results[index]?.username
                if (username) void loadProfile(index, username)
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default CompareProfiles
