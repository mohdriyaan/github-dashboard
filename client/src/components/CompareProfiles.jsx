import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Check,
  Copy,
  Download,
} from "lucide-react"

import { toPng } from "html-to-image"

import ActivityGraph from "./ActivityGraph.jsx"

import {
  getComparisonProfileData,
} from "../services/backendService.js"

import repoStats from "../utils/repoStats.js"
import getErrorMessage from "../utils/githubErrors.js"

const PROFILE_LABELS = [
  "Profile A",
  "Profile B",
  "Profile C",
]

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

const getHeadingId = (username) => (
  `comparison-${String(username || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`
)

const createLoadingResult = (username) => ({
  username,
  isLoading: true,
  profile: null,
  profileError: null,
  repos: [],
  reposError: null,
  stats: null,
  contributionCalendar: null,
  contributionsError: null,
})

const Metric = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-t border-border py-3 first:border-t-0 first:pt-0">
    <dt className="text-sm text-muted-foreground">
      {label}
    </dt>

    <dd className="font-mono text-sm font-semibold tabular-nums">
      {value}
    </dd>
  </div>
)

const ComparisonSkeleton = ({ username }) => (
  <section
    aria-label={`Loading ${username}`}
    className="space-y-6 p-5 sm:p-7"
  >
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
        <div
          key={item}
          className="h-4 w-full animate-pulse rounded bg-muted"
        />
      ))}
    </div>
  </section>
)

const ComparisonError = ({
  username,
  error,
  onRetry,
}) => (
  <section className="flex min-h-72 flex-col justify-center p-5 sm:p-7">
    <p className="font-mono text-sm text-muted-foreground">
      @{username}
    </p>

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

const ComparisonColumn = ({
  result,
  onRetry,
}) => {
  if (result?.isLoading) {
    return (
      <ComparisonSkeleton
        username={result.username}
      />
    )
  }

  if (result?.profileError) {
    return (
      <ComparisonError
        username={result.username}
        error={result.profileError}
        onRetry={onRetry}
      />
    )
  }

  if (!result?.profile) {
    return null
  }

  const { profile } = result

  const repositoryStats = repoStats(
    result.repos
  )

  const hasRepositoryData =
    !result.reposError

  const hasPartialError =
    result.reposError ||
    result.contributionsError

  const headingId = getHeadingId(
    profile.login
  )

  const initials = getInitials(
    profile.name,
    profile.login
  )

  return (
    <section
      aria-labelledby={`${headingId}-heading`}
      className="p-5 sm:p-7"
    >
      <div className="flex min-w-0 items-start gap-4">
        <Avatar className="size-16 shrink-0 border border-border">
          <AvatarImage
            src={profile.avatar_url}
            alt={`${profile.login} avatar`}
          />

          <AvatarFallback className="font-mono text-base">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h3
            id={`${headingId}-heading`}
            className="truncate text-xl font-semibold tracking-tight"
          >
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
        <Metric
          label="Followers"
          value={formatNumber(profile.followers)}
        />

        <Metric
          label="Following"
          value={formatNumber(profile.following)}
        />

        <Metric
          label="Public repositories"
          value={formatNumber(profile.public_repos)}
        />
      </dl>

      <section
        className="mt-7 border-t border-border pt-5"
        aria-labelledby={`${headingId}-repository-heading`}
      >
        <h4
          id={`${headingId}-repository-heading`}
          className="text-sm font-semibold"
        >
          Repository & community
        </h4>

        <dl className="mt-4">
          <Metric
            label="Total stars"
            value={
              hasRepositoryData
                ? formatNumber(
                  repositoryStats.totalStars
                )
                : "Unavailable"
            }
          />

          <Metric
            label="Total forks"
            value={
              hasRepositoryData
                ? formatNumber(
                  repositoryStats.totalForks
                )
                : "Unavailable"
            }
          />

          <Metric
            label="Most-used language"
            value={
              hasRepositoryData
                ? repositoryStats.mostUsedLanguage ||
                "Not specified"
                : "Unavailable"
            }
          />
        </dl>
      </section>

      {result.contributionCalendar &&
        result.stats && (
          <section
            className="mt-7 border-t border-border pt-5"
            aria-label={`${profile.login} contribution activity`}
          >
            <ActivityGraph
              calendar={
                result.contributionCalendar
              }
              stats={result.stats}
              compact
            />
          </section>
        )}

      <section
        className="mt-7 border-t border-border pt-5"
        aria-labelledby={`${headingId}-activity-heading`}
      >
        <h4
          id={`${headingId}-activity-heading`}
          className="text-sm font-semibold"
        >
          Activity
        </h4>

        <dl className="mt-4">
          <Metric
            label="Contributions"
            value={
              result.stats
                ? formatNumber(
                  result.stats.totalContributions
                )
                : "Unavailable"
            }
          />

          <Metric
            label="Current streak"
            value={
              result.stats
                ? `${formatNumber(
                  result.stats.currentStreak
                )} days`
                : "Unavailable"
            }
          />

          <Metric
            label="Longest streak"
            value={
              result.stats
                ? `${formatNumber(
                  result.stats.longestStreak
                )} days`
                : "Unavailable"
            }
          />
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

const ComparisonInsights = ({ results }) => {
  const insights = useMemo(() => {
    const profiles = results.filter(
      (result) =>
        result?.profile &&
        !result?.profileError
    )

    if (profiles.length < 2) {
      return []
    }

    const getContributionCount = (result) => (
      Number(
        result.stats?.totalContributions
      ) || 0
    )

    const getCurrentStreak = (result) => (
      Number(
        result.stats?.currentStreak
      ) || 0
    )

    const getFollowerCount = (result) => (
      Number(result.profile?.followers) || 0
    )

    const getStarCount = (result) => {
      if (result.reposError) {
        return null
      }

      return Number(
        repoStats(result.repos).totalStars
      ) || 0
    }

    const mostContributions = [...profiles]
      .sort(
        (a, b) =>
          getContributionCount(b) -
          getContributionCount(a)
      )

    const longestCurrentStreak = [...profiles]
      .sort(
        (a, b) =>
          getCurrentStreak(b) -
          getCurrentStreak(a)
      )

    const mostFollowers = [...profiles]
      .sort(
        (a, b) =>
          getFollowerCount(b) -
          getFollowerCount(a)
      )

    const profilesWithStars = profiles.filter(
      (result) =>
        !result.reposError
    )

    const mostStars =
      profilesWithStars.length >= 2
        ? [...profilesWithStars].sort(
          (a, b) =>
            getStarCount(b) -
            getStarCount(a)
        )[0]
        : null

    const topContributions =
      mostContributions[0]
    const secondContributions =
      mostContributions[1]

    const topContributionCount =
      getContributionCount(
        topContributions
      )

    const secondContributionCount =
      getContributionCount(
        secondContributions
      )

    const comparisonInsights = []

    if (
      topContributionCount >
      secondContributionCount
    ) {
      const topUsername =
        topContributions.profile.login

      const secondUsername =
        secondContributions.profile.login

      if (
        secondContributionCount > 0
      ) {
        const ratio =
          topContributionCount /
          secondContributionCount

        comparisonInsights.push(
          `@${topUsername} has ${ratio.toFixed(
            1
          )}× more public contributions than @${secondUsername}.`
        )
      } else {
        comparisonInsights.push(
          `@${topUsername} has ${formatNumber(
            topContributionCount
          )} public contributions; the next-highest compared profile has none.`
        )
      }
    } else {
      comparisonInsights.push(
        "The compared profiles have the same public contribution count."
      )
    }

    const topStreak =
      longestCurrentStreak[0]

    const secondStreak =
      longestCurrentStreak[1]

    const topStreakValue =
      getCurrentStreak(topStreak)

    const secondStreakValue =
      getCurrentStreak(secondStreak)

    if (
      topStreakValue >
      secondStreakValue
    ) {
      comparisonInsights.push(
        `@${topStreak.profile.login} has the longest current streak at ${formatNumber(
          topStreakValue
        )} days.`
      )
    } else {
      comparisonInsights.push(
        "The compared profiles have the same current streak."
      )
    }

    const topFollowers =
      mostFollowers[0]

    const secondFollowers =
      mostFollowers[1]

    const topFollowerValue =
      getFollowerCount(topFollowers)

    const secondFollowerValue =
      getFollowerCount(secondFollowers)

    if (
      topFollowerValue >
      secondFollowerValue
    ) {
      comparisonInsights.push(
        `@${topFollowers.profile.login} has the largest follower count at ${formatNumber(
          topFollowerValue
        )}.`
      )
    } else {
      comparisonInsights.push(
        "The compared profiles have the same follower count."
      )
    }

    if (mostStars) {
      comparisonInsights.push(
        `@${mostStars.profile.login} has the most repository stars at ${formatNumber(
          getStarCount(mostStars)
        )}.`
      )
    }

    return comparisonInsights
  }, [results])

  if (insights.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="comparison-insights-heading"
      className="border-y border-border py-6"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h3
            id="comparison-insights-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Comparison insights
          </h3>

          <p className="text-sm text-muted-foreground">
            Factual differences across the compared profiles.
          </p>
        </div>

        <div className="divide-y divide-border">
          {insights.map(
            (insight, index) => (
              <p
                key={index}
                className="py-4 text-sm leading-6 first:pt-0 last:pb-0"
              >
                {insight}
              </p>
            )
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Based on public activity only.
        </p>
      </div>
    </section>
  )
}

const ComparisonSnapshot = ({ results }) => {
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const snapshotRef = useRef(null)

  const profiles = useMemo(
    () =>
      results.filter(
        (result) =>
          result?.profile &&
          !result?.profileError
      ),
    [results]
  )

  const snapshotInsights = useMemo(() => {
    if (profiles.length < 2) {
      return []
    }

    const getContributionCount = (result) => (
      Number(
        result.stats?.totalContributions
      ) || 0
    )

    const getCurrentStreak = (result) => (
      Number(
        result.stats?.currentStreak
      ) || 0
    )

    const getFollowerCount = (result) => (
      Number(result.profile?.followers) || 0
    )

    const getStarCount = (result) => {
      if (result.reposError) {
        return null
      }

      return Number(
        repoStats(result.repos).totalStars
      ) || 0
    }

    const byContributions = [...profiles].sort(
      (a, b) =>
        getContributionCount(b) -
        getContributionCount(a)
    )

    const byStreak = [...profiles].sort(
      (a, b) =>
        getCurrentStreak(b) -
        getCurrentStreak(a)
    )

    const byFollowers = [...profiles].sort(
      (a, b) =>
        getFollowerCount(b) -
        getFollowerCount(a)
    )

    const profilesWithStars = profiles.filter(
      (result) => !result.reposError
    )

    const byStars =
      profilesWithStars.length >= 2
        ? [...profilesWithStars].sort(
          (a, b) =>
            getStarCount(b) -
            getStarCount(a)
        )
        : []

    const insights = []

    const topContributions =
      getContributionCount(byContributions[0])

    const secondContributions =
      getContributionCount(byContributions[1])

    if (topContributions > secondContributions) {
      insights.push(
        `@${byContributions[0].profile.login} leads public contributions with ${formatNumber(
          topContributions
        )}.`
      )
    } else {
      insights.push(
        "The compared profiles have the same public contribution count."
      )
    }

    const topStreak =
      getCurrentStreak(byStreak[0])

    const secondStreak =
      getCurrentStreak(byStreak[1])

    if (topStreak > secondStreak) {
      insights.push(
        `@${byStreak[0].profile.login} has the longest current streak at ${formatNumber(
          topStreak
        )} days.`
      )
    } else {
      insights.push(
        "The compared profiles have the same current streak."
      )
    }

    const topFollowers =
      getFollowerCount(byFollowers[0])

    const secondFollowers =
      getFollowerCount(byFollowers[1])

    if (topFollowers > secondFollowers) {
      insights.push(
        `@${byFollowers[0].profile.login} has the largest follower count at ${formatNumber(
          topFollowers
        )}.`
      )
    } else {
      insights.push(
        "The compared profiles have the same follower count."
      )
    }

    if (byStars.length >= 2) {
      const topStars =
        getStarCount(byStars[0])

      const secondStars =
        getStarCount(byStars[1])

      if (topStars > secondStars) {
        insights.push(
          `@${byStars[0].profile.login} has the most repository stars at ${formatNumber(
            topStars
          )}.`
        )
      } else {
        insights.push(
          "The compared profiles have the same repository star count."
        )
      }
    }

    return insights
  }, [profiles])

  const snapshotText = useMemo(() => {
    if (profiles.length < 2) {
      return ""
    }

    const lines = [
      "GitHub Profile Comparison",
      "",
      profiles
        .map(
          (result) =>
            `@${result.profile.login}`
        )
        .join(" vs "),
      "",
    ]

    profiles.forEach((result) => {
      const contributions =
        Number(
          result.stats?.totalContributions
        ) || 0

      const currentStreak =
        Number(
          result.stats?.currentStreak
        ) || 0

      const followers =
        Number(
          result.profile?.followers
        ) || 0

      lines.push(
        `@${result.profile.login}`,
        `  ${formatNumber(contributions)} public contributions`,
        `  ${formatNumber(currentStreak)} day current streak`,
        `  ${formatNumber(followers)} followers`
      )

      if (!result.reposError) {
        const stars =
          Number(
            repoStats(result.repos).totalStars
          ) || 0

        lines.push(
          `  ${formatNumber(stars)} repository stars`
        )
      }

      lines.push("")
    })

    lines.push(
      "Comparison insights",
      ...snapshotInsights.map(
        (insight) => `- ${insight}`
      ),
      "",
      "Based on public activity only."
    )

    return lines.join("\n")
  }, [profiles, snapshotInsights])

  const handleCopy = async () => {
    if (!snapshotText) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        snapshotText
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch {
      setCopied(false)
    }
  }

  const handleExport = async () => {
    if (
      !snapshotRef.current ||
      profiles.length < 2 ||
      isExporting
    ) {
      return
    }

    setIsExporting(true)

    try {
      const dataUrl = await toPng(
        snapshotRef.current,
        {
          pixelRatio: 2,
          cacheBust: true,
        }
      )

      const usernames = profiles
        .map(
          (result) =>
            result.profile.login
        )
        .join("-")

      const link =
        document.createElement("a")

      link.download =
        `${usernames}-github-comparison.png`

      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error(
        "Failed to export comparison snapshot:",
        error
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (profiles.length < 2) {
    return null
  }

  return (
    <section
      aria-labelledby="comparison-snapshot-heading"
      className="border-y border-border py-10"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h3
              id="comparison-snapshot-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Comparison snapshot
            </h3>

            <p className="max-w-xl text-sm text-muted-foreground">
              A shareable summary of the compared public activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check
                    className="size-4"
                    aria-hidden="true"
                  />
                  Copied
                </>
              ) : (
                <>
                  <Copy
                    className="size-4"
                    aria-hidden="true"
                  />
                  Copy snapshot
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              aria-busy={isExporting}
            >
              <Download
                className="size-4"
                aria-hidden="true"
              />
              {isExporting
                ? "Exporting…"
                : "Save image"}
            </Button>
          </div>
        </div>

        <article
          ref={snapshotRef}
          aria-label="GitHub profile comparison snapshot"
          className="border border-border bg-background"
        >
          <div className="p-6 sm:p-8">
            <div className="border-b border-border pb-7">
              <p className="text-sm font-medium text-muted-foreground">
                GitHub Profile Comparison
              </p>

              <h4 className="mt-3 text-2xl font-semibold tracking-tight">
                {profiles
                  .map(
                    (result) =>
                      `@${result.profile.login}`
                  )
                  .join(" vs ")}
              </h4>
            </div>

            <div
              className={
                profiles.length === 3
                  ? "grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"
                  : "grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0"
              }
            >
              {profiles.map((result) => {
                const contributions =
                  Number(
                    result.stats?.totalContributions
                  ) || 0

                const currentStreak =
                  Number(
                    result.stats?.currentStreak
                  ) || 0

                const followers =
                  Number(
                    result.profile?.followers
                  ) || 0

                const stars = result.reposError
                  ? null
                  : Number(
                    repoStats(
                      result.repos
                    ).totalStars
                  ) || 0

                return (
                  <div
                    key={result.profile.login}
                    className="py-6 first:sm:pr-6 last:sm:pl-6 sm:px-6"
                  >
                    <p className="font-mono text-sm text-muted-foreground">
                      @{result.profile.login}
                    </p>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Public contributions
                        </p>

                        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                          {formatNumber(
                            contributions
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Current streak
                        </p>

                        <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                          {formatNumber(
                            currentStreak
                          )}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            days
                          </span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Followers
                        </p>

                        <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                          {formatNumber(
                            followers
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Repository stars
                        </p>

                        <p className="mt-1 font-mono text-xl font-semibold tabular-nums">
                          {stars === null
                            ? "Unavailable"
                            : formatNumber(stars)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border pt-7">
              <p className="text-sm font-semibold">
                Comparison insights
              </p>

              <div className="mt-4 divide-y divide-border">
                {snapshotInsights.map(
                  (insight, index) => (
                    <p
                      key={index}
                      className="py-3 text-sm leading-6 first:pt-0 last:pb-0"
                    >
                      {insight}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>

          <footer className="border-t border-border px-6 py-4 sm:px-8">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Based on public activity only.
            </p>
          </footer>
        </article>
      </div>
    </section>
  )
}

const CompareProfiles = () => {
  const [usernames, setUsernames] =
    useState(["", ""])

  const [results, setResults] =
    useState([null, null])

  const [formError, setFormError] =
    useState("")

  const requestIdsRef = useRef([
    0,
    0,
    0,
  ])

  useEffect(
    () => () => {
      requestIdsRef.current =
        requestIdsRef.current.map(
          (requestId) =>
            requestId + 1
        )
    },
    []
  )

  const hasThirdProfile =
    usernames.length === 3

  const loadProfile = async (
    index,
    username
  ) => {
    const requestId =
      ++requestIdsRef.current[index]

    setResults((current) => {
      const next = [...current]

      next[index] =
        createLoadingResult(username)

      return next
    })

    try {
      const result =
        await getComparisonProfileData(
          username
        )

      if (
        requestIdsRef.current[index] !==
        requestId
      ) {
        return
      }

      setResults((current) => {
        const next = [...current]

        next[index] = {
          ...result,
          isLoading: false,
        }

        return next
      })
    } catch (error) {
      if (
        requestIdsRef.current[index] !==
        requestId
      ) {
        return
      }

      setResults((current) => {
        const next = [...current]

        next[index] = {
          username,
          isLoading: false,
          profile: null,
          profileError: error,
          repos: [],
          reposError: null,
          stats: null,
          contributionCalendar: null,
          contributionsError: null,
        }

        return next
      })
    }
  }

  const submitComparison = (
    event
  ) => {
    event.preventDefault()

    const trimmedUsernames =
      usernames.map((username) =>
        username.trim()
      )

    if (
      !trimmedUsernames[0] ||
      !trimmedUsernames[1]
    ) {
      setFormError(
        "Enter at least two GitHub usernames to compare profiles."
      )
      return
    }

    setFormError("")

    trimmedUsernames.forEach(
      (username, index) => {
        if (username) {
          void loadProfile(
            index,
            username
          )
        }
      }
    )
  }

  const addProfile = () => {
    if (hasThirdProfile) return

    setUsernames((current) => [
      ...current,
      "",
    ])

    setResults((current) => [
      ...current,
      null,
    ])
  }

  const removeProfile = () => {
    if (!hasThirdProfile) return

    requestIdsRef.current[2] += 1

    setUsernames((current) =>
      current.slice(0, 2)
    )

    setResults((current) =>
      current.slice(0, 2)
    )
  }

  const hasResults =
    results.some(Boolean)

  return (
    <section
      aria-labelledby="compare-profiles-heading"
      className="space-y-8"
    >
      <div className="max-w-2xl space-y-2">
        <h2
          id="compare-profiles-heading"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Compare profiles
        </h2>

        <p className="text-base leading-6 text-muted-foreground">
          Compare public profile, repository, and
          contribution activity side by side.
        </p>
      </div>

      <form
        onSubmit={submitComparison}
        className="border-y border-border py-5"
      >
        <div
          className={
            hasThirdProfile
              ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
              : "grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
          }
        >
          {usernames.map(
            (username, index) => (
              <div
                key={index}
                className="space-y-2"
              >
                <label
                  htmlFor={`compare-username-${index}`}
                  className="text-sm font-medium"
                >
                  GitHub username
                  <span className="sr-only">
                    {" "}
                    {PROFILE_LABELS[index]}
                  </span>
                </label>

                <Input
                  id={`compare-username-${index}`}
                  name={`compare-username-${index}`}
                  value={username}
                  onChange={(event) => {
                    const value =
                      event.target.value

                    setUsernames(
                      (current) => {
                        const next = [
                          ...current,
                        ]

                        next[index] =
                          value

                        return next
                      }
                    )
                  }}
                  placeholder={
                    index === 0
                      ? "octocat"
                      : index === 1
                        ? "hubot"
                        : "torvalds"
                  }
                  autoComplete="off"
                />
              </div>
            )
          )}

          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <Button
              type="submit"
              className="w-full lg:w-auto"
            >
              Compare
            </Button>

            {!hasThirdProfile ? (
              <Button
                type="button"
                variant="outline"
                onClick={addProfile}
              >
                + Add profile
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={removeProfile}
              >
                Remove profile
              </Button>
            )}
          </div>
        </div>

        {formError && (
          <p
            role="alert"
            className="mt-3 text-sm text-destructive"
          >
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
        <>
          <div
            className={
              results.length === 3
                ? "grid divide-y divide-border border-y border-border md:grid-cols-3 md:divide-y-0 md:divide-x md:divide-border"
                : "grid divide-y divide-border border-y border-border md:grid-cols-2 md:divide-y-0 md:divide-x md:divide-border"
            }
          >
            {results.map(
              (result, index) => (
                <ComparisonColumn
                  key={
                    result?.username ||
                    `comparison-${index}`
                  }
                  result={result}
                  onRetry={() => {
                    const username =
                      result?.username

                    if (username) {
                      void loadProfile(
                        index,
                        username
                      )
                    }
                  }}
                />
              )
            )}
          </div>

          <ComparisonInsights
            results={results}
          />

          <ComparisonSnapshot
            results={results}
          />
        </>
      )}
    </section>
  )
}

export default CompareProfiles