const normalizeNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const normalizeProfile = (profile) => ({
  username: profile?.login || "",
  name: profile?.name || profile?.login || "",
})

const normalizeStats = (stats) => ({
  totalContributions: normalizeNumber(
    stats?.totalContributions
  ),
  currentStreak: normalizeNumber(
    stats?.currentStreak
  ),
  longestStreak: normalizeNumber(
    stats?.longestStreak
  ),
})

const normalizeInsights = (insights) => ({
  mostActiveWeekday:
    insights?.mostActiveWeekday ?? null,

  mostActiveMonth:
    insights?.mostActiveMonth ?? null,

  weekdayContributionRatio:
    Number.isFinite(
      Number(
        insights?.weekdayContributionRatio
      )
    )
      ? Number(
          insights.weekdayContributionRatio
        )
      : 0,

  weekendContributionRatio:
    Number.isFinite(
      Number(
        insights?.weekendContributionRatio
      )
    )
      ? Number(
          insights.weekendContributionRatio
        )
      : 0,

  longestContributionGap:
    normalizeNumber(
      insights?.longestContributionGap
    ),

  historyMonthCount:
    normalizeNumber(
      insights?.historyMonthCount
    ),

  activityArchetype:
    insights?.activityArchetype ||
    "Consistent Contributor",

  publicActivityDisclaimer:
    insights?.publicActivityDisclaimer ||
    "Based on public activity only.",
})

export const createShareableSnapshot = ({
  profile,
  stats,
  insights,
}) => {
  const normalizedProfile =
    normalizeProfile(profile)

  const normalizedStats =
    normalizeStats(stats)

  const normalizedInsights =
    normalizeInsights(insights)

  return {
    type: "github-activity-snapshot",
    version: 1,

    profile: normalizedProfile,

    stats: normalizedStats,

    insights: normalizedInsights,

    createdAt: new Date().toISOString(),
  }
}