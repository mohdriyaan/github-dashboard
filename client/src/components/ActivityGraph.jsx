import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Skeleton } from "@/components/ui/skeleton"

const contributionColors = {
  0: "bg-contrib-0",
  1: "bg-contrib-1",
  2: "bg-contrib-2",
  3: "bg-contrib-3",
  4: "bg-contrib-4",
}

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]

const getContributionLevel = (count) => {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3

  return 4
}

const getDateWeekday = (date) => {
  const weekday = new Date(`${date}T00:00:00`).getDay()

  return weekday === 0 ? 7 : weekday
}

const getCurrentStreakDates = (calendar, currentStreak) => {
  if (!calendar?.weeks?.length || currentStreak <= 0) {
    return new Set()
  }

  const days = calendar.weeks.flatMap(
    (week) => week.contributionDays
  )

  let startIndex = days.length - 1

  if (days[startIndex]?.contributionCount === 0) {
    startIndex -= 1
  }

  const streakDates = new Set()

  for (
    let i = startIndex;
    i >= 0 && streakDates.size < currentStreak;
    i -= 1
  ) {
    if (days[i].contributionCount === 0) {
      break
    }

    streakDates.add(days[i].date)
  }

  return streakDates
}

const getMonthLabel = (date) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
  }).format(new Date(`${date}T00:00:00`))
}

const getWeekMonthLabels = (weeks) => {
  let previousMonth = null
  let previousYear = null

  return weeks.map((week) => {
    const firstDay = week.contributionDays[0]

    if (!firstDay) {
      return ""
    }

    const date = new Date(`${firstDay.date}T00:00:00`)
    const month = date.getMonth()
    const year = date.getFullYear()

    const isNewMonth =
      month !== previousMonth || year !== previousYear

    const label = isNewMonth
      ? getMonthLabel(firstDay.date)
      : ""

    previousMonth = month
    previousYear = year

    return label
  })
}

const ActivityGraph = ({ calendar, stats, isLoading }) => {
  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-8">
          <div className="space-y-3">
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-6 w-60" />
          </div>

          <div className="space-y-3 text-right">
            <Skeleton className="ml-auto h-14 w-20" />
            <Skeleton className="ml-auto h-6 w-28" />
          </div>
        </div>

        <Skeleton className="h-[320px] w-full rounded-md" />
      </section>
    )
  }

  if (!calendar?.weeks?.length) {
    return null
  }

  const streakDates = getCurrentStreakDates(
    calendar,
    stats?.currentStreak
  )

  const monthLabels = getWeekMonthLabels(calendar.weeks)

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
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

      {/* Graph */}
      <div className="w-full overflow-x-auto rounded-md border border-border">
        <div className="min-w-[1600px] p-6 sm:p-8 md:p-10">
          {/* Month labels */}
          <div className="flex">
            <div className="w-10 shrink-0" />

            <div className="flex gap-[7px]">
              {monthLabels.map((label, index) => (
                <div
                  key={index}
                  className="w-[26px] shrink-0 font-mono text-sm font-medium text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Graph body */}
          <div className="mt-5 flex gap-4">
            {/* Day labels */}
            <div className="grid w-7 shrink-0 grid-rows-7 gap-[7px]">
              {dayLabels.map((label, index) => (
                <span
                  key={index}
                  className="flex h-[26px] items-center text-sm font-medium text-muted-foreground"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-[7px]">
              {calendar.weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid w-[26px] grid-rows-7 gap-[7px]"
                >
                  {week.contributionDays.map((day) => {
                    const level = getContributionLevel(
                      day.contributionCount
                    )

                    const isCurrentStreak =
                      streakDates.has(day.date)

                    const row = getDateWeekday(day.date)

                    return (
                      <Tooltip key={day.date}>
                        <TooltipTrigger
                          render={
                            <button
                              type="button"
                              aria-label={`${day.contributionCount} contributions on ${day.date}`}
                              style={{
                                gridRow: row,
                              }}
                              className={[
                                "size-[26px] rounded-[5px]",
                                contributionColors[level],
                                "transition-opacity",
                                "hover:opacity-80",
                                "focus-visible:outline-none",
                                "focus-visible:ring-2",
                                "focus-visible:ring-ring",
                                "focus-visible:ring-offset-2",
                                "focus-visible:ring-offset-background",
                                isCurrentStreak
                                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                  : "",
                              ].join(" ")}
                            />
                          }
                        />

                        <TooltipContent>
                          <p className="font-mono text-sm tabular-nums">
                            {day.date}
                          </p>

                          <p className="mt-1 text-sm">
                            {day.contributionCount}{" "}
                            {day.contributionCount === 1
                              ? "contribution"
                              : "contributions"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-10 flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">
              Less
            </span>

            <div className="flex items-center gap-[7px]">
              {Object.entries(contributionColors).map(
                ([level, colorClass]) => (
                  <span
                    key={level}
                    aria-hidden="true"
                    className={`size-[26px] rounded-[5px] ${colorClass}`}
                  />
                )
              )}
            </div>

            <span className="text-base font-medium text-muted-foreground">
              More
            </span>
          </div>
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