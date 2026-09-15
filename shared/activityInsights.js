import {
  calculateLongestContributionGap,
  calculateMonthlyContributions,
  calculateMostActiveMonth,
  calculateMostActiveWeekday,
  calculateWeekdayContributionRatio,
} from "./contributionStats.js"

import { determineActivityArchetype } from "./activityArchetype.js"

const PUBLIC_ACTIVITY_DISCLAIMER =
  "Based on public activity only."

export const calculateActivityInsights = ({
  days,
  totalContributions,
  currentStreak,
  longestStreak,
}) => {
  const monthlyContributions =
    calculateMonthlyContributions(days)

  const mostActiveWeekday =
    calculateMostActiveWeekday(days)

  const mostActiveMonth =
    calculateMostActiveMonth(days)

  const weekdayContributionRatio =
    calculateWeekdayContributionRatio(days)

  const weekendContributionRatio =
    Math.max(0, 1 - weekdayContributionRatio)

  const longestContributionGap =
    calculateLongestContributionGap(days)

  const activityArchetype =
    determineActivityArchetype({
      totalContributions,
      monthContributions: monthlyContributions,
      weekdayContributionRatio,
      currentStreak,
      longestStreak,
    })

  return {
    mostActiveWeekday,
    mostActiveMonth,
    monthlyContributions,
    weekdayContributionRatio,
    weekendContributionRatio,
    longestContributionGap,
    historyMonthCount: monthlyContributions.length,
    activityArchetype,
    publicActivityDisclaimer:
      PUBLIC_ACTIVITY_DISCLAIMER,
  }
}