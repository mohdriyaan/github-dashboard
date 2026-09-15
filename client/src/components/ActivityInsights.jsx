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
    Date.UTC(Number(year), Number(monthNumber) - 1, 1)
  )

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

const formatPercentage = (value) => (
  `${Math.round(value * 100)}%`
)

const ActivityInsights = ({ insights }) => {
  if (!insights) return null

  const {
    mostActiveWeekday,
    mostActiveMonth,
    weekdayContributionRatio,
    weekendContributionRatio,
    longestContributionGap,
    activityArchetype,
    publicActivityDisclaimer,
  } = insights

  return (
    <section
      aria-labelledby="activity-insights-heading"
      className="border-y border-border py-6"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2
            id="activity-insights-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Activity insights
          </h2>

          <p className="text-sm text-muted-foreground">
            Patterns derived from the contribution history.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Most active weekday
            </p>

            <p className="font-mono text-lg font-semibold">
              {mostActiveWeekday?.weekday
                ? WEEKDAY_NAMES[mostActiveWeekday.weekday - 1]
                : "Not available"}
            </p>

            <p className="text-xs text-muted-foreground">
              {mostActiveWeekday?.contributions ?? 0} contributions
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Most active month
            </p>

            <p className="font-mono text-lg font-semibold">
              {formatMonth(mostActiveMonth?.month)}
            </p>

            <p className="text-xs text-muted-foreground">
              {mostActiveMonth?.contributions ?? 0} contributions
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Weekday activity
            </p>

            <p className="font-mono text-lg font-semibold">
              {formatPercentage(
                weekdayContributionRatio
              )}
            </p>

            <p className="text-xs text-muted-foreground">
              {formatPercentage(
                weekendContributionRatio
              )} on weekends
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Longest gap
            </p>

            <p className="font-mono text-lg font-semibold">
              {longestContributionGap} days
            </p>

            <p className="text-xs text-muted-foreground">
              without a contribution
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            Activity pattern
          </p>

          <p className="mt-1 text-lg font-semibold tracking-tight">
            {activityArchetype}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            {publicActivityDisclaimer}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ActivityInsights