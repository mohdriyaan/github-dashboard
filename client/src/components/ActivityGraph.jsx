import { useMemo, useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Skeleton } from "@/components/ui/skeleton"

const GRAPH = {
  cellSize: 11,
  gap: 3,
  labelWidth: 28,
  monthRowHeight: 18,
  weekCount: 53,
}

const GRAPH_WIDTH =
  GRAPH.labelWidth +
  GRAPH.weekCount * GRAPH.cellSize +
  (GRAPH.weekCount - 1) * GRAPH.gap

const GRAPH_HEIGHT =
  GRAPH.monthRowHeight +
  7 * GRAPH.cellSize +
  6 * GRAPH.gap

const dayLabels = [
  { label: "M", row: 0 },
  { label: "W", row: 2 },
  { label: "F", row: 4 },
]

const contributionLevel = (count) => {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3

  return 4
}

const getWeekdayIndex = (date) => {
  const weekday = new Date(
    `${date}T00:00:00`
  ).getDay()

  return weekday === 0 ? 6 : weekday - 1
}

const getMonthLabel = (date) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
  }).format(
    new Date(`${date}T00:00:00`)
  )
}

const getMonthStarts = (weeks) => {
  const months = []
  const seen = new Set()

  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day) => {
      const monthKey = day.date.slice(0, 7)

      if (
        day.date.endsWith("-01") &&
        !seen.has(monthKey)
      ) {
        seen.add(monthKey)

        months.push({
          label: getMonthLabel(day.date),
          weekIndex,
        })
      }
    })
  })

  return months
}

/*
 * Normalize every week into exactly seven weekday slots.
 *
 * Index:
 * 0 → Monday
 * 1 → Tuesday
 * 2 → Wednesday
 * 3 → Thursday
 * 4 → Friday
 * 5 → Saturday
 * 6 → Sunday
 *
 * Missing dates remain null.
 */
const normalizeWeek = (week) => {
  const rows = Array(7).fill(null)

  week.contributionDays.forEach((day) => {
    const weekday = getWeekdayIndex(day.date)

    rows[weekday] = day
  })

  return rows
}

const getCurrentStreakDates = (
  calendar,
  currentStreak
) => {
  if (
    !calendar?.weeks?.length ||
    currentStreak <= 0
  ) {
    return new Set()
  }

  const days = calendar.weeks.flatMap(
    (week) => week.contributionDays
  )

  let index = days.length - 1

  if (
    days[index]?.contributionCount === 0
  ) {
    index -= 1
  }

  const streakDates = new Set()

  for (
    let i = index;
    i >= 0 &&
    streakDates.size < currentStreak;
    i -= 1
  ) {
    if (days[i].contributionCount === 0) {
      break
    }

    streakDates.add(days[i].date)
  }

  return streakDates
}

const getCellX = (weekIndex) => {
  return (
    GRAPH.labelWidth +
    weekIndex *
    (GRAPH.cellSize + GRAPH.gap)
  )
}

const getCellY = (rowIndex) => {
  return (
    GRAPH.monthRowHeight +
    rowIndex *
    (GRAPH.cellSize + GRAPH.gap)
  )
}

const ContributionTooltip = ({
  day,
  children,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />

      <TooltipContent
        side="top"
        align="center"
        sideOffset={8}
        collisionPadding={8}
        className="border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 shadow-lg"
      >
        <p className="text-sm font-medium leading-5">
          {day.contributionCount}{" "}
          {day.contributionCount === 1
            ? "contribution"
            : "contributions"}{" "}
          on{" "}
          <span className="font-mono tabular-nums">
            {day.date}
          </span>
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

const ActivityGraph = ({
  calendar,
  stats,
  isLoading,
}) => {
  const [focusedDate, setFocusedDate] =
    useState(null)

  const weeks = calendar?.weeks ?? []

  /*
   * Phase A:
   * Normalize every week into seven fixed weekday
   * positions before touching the rendering logic.
   */
  const normalizedWeeks = useMemo(() => {
    return weeks.map(normalizeWeek)
  }, [weeks])

  const monthStarts = useMemo(() => {
    return getMonthStarts(weeks)
  }, [weeks])

  const streakDates = useMemo(() => {
    return getCurrentStreakDates(
      calendar,
      stats?.currentStreak
    )
  }, [
    calendar,
    stats?.currentStreak,
  ])

  if (isLoading) {
    return (
      <section
        aria-label="Loading contribution activity"
        className="space-y-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="space-y-3">
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-6 w-60" />
          </div>

          <div className="space-y-3 text-right">
            <Skeleton className="ml-auto h-14 w-20" />
            <Skeleton className="ml-auto h-6 w-28" />
          </div>
        </div>

        <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            aria-hidden="true"
            className="block"
          >
            {Array.from({
              length: GRAPH.weekCount,
            }).map((_, weekIndex) =>
              Array.from({
                length: 7,
              }).map((__, rowIndex) => (
                <rect
                  key={`${weekIndex}-${rowIndex}`}
                  x={getCellX(weekIndex)}
                  y={getCellY(rowIndex)}
                  width={GRAPH.cellSize}
                  height={GRAPH.cellSize}
                  rx="2"
                  fill="currentColor"
                  className="animate-pulse text-muted"
                />
              ))
            )}
          </svg>
        </div>
      </section>
    )
  }

  if (!weeks.length) {
    return null
  }

  return (
    <section
      aria-labelledby="contribution-activity-heading"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="space-y-3">
          <h2
            id="contribution-activity-heading"
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            Contribution activity
          </h2>

          <p className="text-lg text-muted-foreground">
            <span className="font-mono tabular-nums">
              {stats?.totalContributions ?? 0}
            </span>{" "}
            contributions · last year
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-mono text-5xl font-semibold leading-none tracking-tight tabular-nums sm:text-6xl">
            {stats?.currentStreak ?? 0}
          </p>

          <p className="mt-3 text-base text-muted-foreground">
            day streak
          </p>
        </div>
      </div>

      {/* Contribution graph */}
      <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-max">
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            role="img"
            aria-labelledby="contribution-graph-title contribution-graph-description"
            className="block"
          >
            <title id="contribution-graph-title">
              Contribution activity for the last year
            </title>

            <desc id="contribution-graph-description">
              A calendar heatmap showing daily
              contribution activity across 53 weeks.
            </desc>

            {/* Month labels */}
            {monthStarts.map(
              ({ label, weekIndex }) => (
                <text
                  key={`${label}-${weekIndex}`}
                  x={
                    getCellX(weekIndex) +
                    GRAPH.cellSize / 2
                  }
                  y={12}
                  textAnchor="middle"
                  aria-hidden="true"
                  className="fill-muted-foreground font-mono text-[11px] font-medium"
                >
                  {label}
                </text>
              )
            )}

            {/* Day labels */}
            {dayLabels.map(
              ({ label, row }) => (
                <text
                  key={`${label}-${row}`}
                  x={GRAPH.labelWidth / 2}
                  y={
                    getCellY(row) +
                    GRAPH.cellSize / 2
                  }
                  dominantBaseline="middle"
                  textAnchor="middle"
                  aria-hidden="true"
                  className="fill-muted-foreground font-mono text-[10px] font-medium"
                >
                  {label}
                </text>
              )
            )}

            {/* Normalized contribution cells */}
            {normalizedWeeks.map(
              (week, weekIndex) =>
                week.map((day, rowIndex) => {
                  const x = getCellX(weekIndex)
                  const y = getCellY(rowIndex)

                  if (!day) {
                    return null
                  }

                  const level =
                    contributionLevel(
                      day.contributionCount
                    )

                  const isCurrentStreak =
                    streakDates.has(day.date)

                  const isFocused =
                    focusedDate === day.date

                  const contributionLabel =
                    `${day.contributionCount} ${day.contributionCount === 1
                      ? "contribution"
                      : "contributions"
                    } on ${day.date}`

                  return (
                    <ContributionTooltip
                      key={day.date}
                      day={day}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={GRAPH.cellSize}
                        height={GRAPH.cellSize}
                        rx="2"
                        fill={`var(--contrib-${level})`}
                        tabIndex={0}
                        role="button"
                        aria-label={contributionLabel}
                        className="cursor-pointer outline-none transition-[filter] duration-150 hover:brightness-110 focus-visible:brightness-110"
                        stroke={
                          isCurrentStreak
                            ? "#fbbf24"
                            : isFocused
                              ? "hsl(var(--ring))"
                              : "rgba(255,255,255,0.08)"
                        }
                        strokeWidth={
                          isCurrentStreak ||
                            isFocused
                            ? 1.5
                            : 0.6
                        }
                        onFocus={() =>
                          setFocusedDate(day.date)
                        }
                        onBlur={() =>
                          setFocusedDate(null)
                        }
                      />
                    </ContributionTooltip>
                  )
                })
            )}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-end">
        <div
          className="flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Contribution intensity legend"
        >
          <span>Less</span>

          <div className="flex items-center gap-[2px]">
            {[0, 1, 2, 3, 4].map(
              (level) => (
                <span
                  key={level}
                  aria-hidden="true"
                  className="size-[11px] rounded-[2px] ring-1 ring-inset ring-white/10"
                  style={{
                    backgroundColor:
                      `var(--contrib-${level})`,
                  }}
                />
              )
            )}
          </div>

          <span>More</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end">
        <p className="text-base text-muted-foreground">
          Longest streak ·{" "}
          <span className="font-mono tabular-nums">
            {stats?.longestStreak ?? 0}
          </span>{" "}
          days
        </p>
      </div>
    </section>
  )
}

export default ActivityGraph