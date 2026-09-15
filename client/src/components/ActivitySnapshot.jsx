import { useMemo, useRef, useState } from "react"

import {
  Check,
  Copy,
  Download,
} from "lucide-react"

import { toPng } from "html-to-image"

import { Button } from "@/components/ui/button"

import { createShareableSnapshot } from "../../../shared/shareableSnapshot.js"

const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const formatMonth = (month) => {
  if (!month) return "Not available"

  const [year, monthNumber] = month.split("-")

  const date = new Date(
    Date.UTC(
      Number(year),
      Number(monthNumber) - 1,
      1
    )
  )

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

const formatPercentage = (value) => (
  `${Math.round(Number(value || 0) * 100)}%`
)

const getWeekdayName = (weekday) => {
  const index = Number(weekday)

  return WEEKDAY_NAMES[index] || "Not available"
}

const getMonthValue = (mostActiveMonth) => {
  if (!mostActiveMonth) return null

  return mostActiveMonth.month ?? null
}

const ActivitySnapshot = ({
  profile,
  stats,
  insights,
}) => {
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const snapshotRef = useRef(null)

  const snapshot = useMemo(() => {
    if (!profile || !stats || !insights) {
      return null
    }

    return createShareableSnapshot({
      profile,
      stats,
      insights,
    })
  }, [profile, stats, insights])

  const snapshotText = useMemo(() => {
    if (!snapshot) return ""

    const {
      profile: snapshotProfile,
      stats: snapshotStats,
      insights: snapshotInsights,
    } = snapshot

    const mostActiveWeekday = getWeekdayName(
      snapshotInsights.mostActiveWeekday?.weekday
    )

    const mostActiveMonth = formatMonth(
      getMonthValue(
        snapshotInsights.mostActiveMonth
      )
    )

    return [
      "GitHub Activity Snapshot",
      "",
      `@${snapshotProfile.username}`,
      "",
      `${snapshotStats.totalContributions} public contributions`,
      `${snapshotStats.currentStreak} day current streak`,
      `${snapshotStats.longestStreak} day longest streak`,
      `${mostActiveWeekday} — most active weekday`,
      `${mostActiveMonth} — most active month`,
      `${formatPercentage(
        snapshotInsights.weekdayContributionRatio
      )} weekday activity`,
      snapshotInsights.activityArchetype,
      "",
      snapshotInsights.publicActivityDisclaimer,
    ].join("\n")
  }, [snapshot])

  const handleCopy = async () => {
    if (!snapshotText) return

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
    if (!snapshotRef.current || !snapshot || isExporting) {
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

      const link = document.createElement("a")

      link.download = `${snapshot.profile.username}-github-activity.png`
      link.href = dataUrl

      link.click()
    } catch (error) {
      console.error(
        "Failed to export activity snapshot:",
        error
      )
    } finally {
      setIsExporting(false)
    }
  }

  if (!snapshot) {
    return null
  }

  const {
    profile: snapshotProfile,
    stats: snapshotStats,
    insights: snapshotInsights,
  } = snapshot

  const mostActiveWeekday = getWeekdayName(
    snapshotInsights.mostActiveWeekday?.weekday
  )

  const mostActiveMonth = formatMonth(
    getMonthValue(
      snapshotInsights.mostActiveMonth
    )
  )

  const weekdayActivity = formatPercentage(
    snapshotInsights.weekdayContributionRatio
  )

  return (
    <section
      aria-labelledby="activity-snapshot-heading"
      className="border-y border-border py-10"
    >
      <div className="space-y-6">

        {/* Section header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2
              id="activity-snapshot-heading"
              className="text-xl font-semibold tracking-tight"
            >
              Activity snapshot
            </h2>

            <p className="max-w-xl text-sm text-muted-foreground">
              A compact artifact built from this developer&apos;s
              public GitHub activity.
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

        {/* Shareable visual artifact */}
        <article
          ref={snapshotRef}
          aria-label={`GitHub activity snapshot for ${snapshotProfile.username}`}
          className="border border-border bg-background"
        >
          <div className="p-6 sm:p-8">

            {/* Snapshot identity */}
            <div className="flex flex-col gap-6 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">
                  GitHub Activity Snapshot
                </div>

                <div>
                  <p className="text-2xl font-semibold tracking-tight">
                    @{snapshotProfile.username}
                  </p>

                  {snapshotProfile.name &&
                    snapshotProfile.name !==
                      snapshotProfile.username && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {snapshotProfile.name}
                      </p>
                    )}
                </div>
              </div>

              <div className="font-mono text-xs text-muted-foreground">
                Public activity
              </div>
            </div>

            {/* Primary metrics */}
            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">

              <div className="py-6 sm:pr-6">
                <p className="text-sm text-muted-foreground">
                  Public contributions
                </p>

                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                  {snapshotStats.totalContributions}
                </p>
              </div>

              <div className="py-6 sm:pl-6 lg:px-6">
                <p className="text-sm text-muted-foreground">
                  Current streak
                </p>

                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                  {snapshotStats.currentStreak}

                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              </div>

              <div className="py-6 sm:pr-6 lg:px-6">
                <p className="text-sm text-muted-foreground">
                  Longest streak
                </p>

                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                  {snapshotStats.longestStreak}

                  <span className="ml-1 text-base font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              </div>

              <div className="py-6 sm:pl-6">
                <p className="text-sm text-muted-foreground">
                  Weekday activity
                </p>

                <p className="mt-2 font-mono text-3xl font-semibold tabular-nums tracking-tight">
                  {weekdayActivity}
                </p>
              </div>
            </div>

            {/* Interpreted activity */}
            <div className="border-t border-border pt-7">
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                <div>
                  <p className="text-sm text-muted-foreground">
                    Most active weekday
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {mostActiveWeekday}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Most active month
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {mostActiveMonth}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Activity pattern
                  </p>

                  <p className="mt-2 text-lg font-semibold">
                    {snapshotInsights.activityArchetype}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <footer className="border-t border-border px-6 py-4 sm:px-8">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {snapshotInsights.publicActivityDisclaimer}
            </p>
          </footer>
        </article>
      </div>
    </section>
  )
}

export default ActivitySnapshot