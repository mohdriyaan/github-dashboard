import {
  normalizeContributionDays,
} from "../../shared/contributionCalendar.js"
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalContributions,
} from "../../shared/contributionStats.js"

export {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalContributions,
  normalizeContributionDays,
}

const getContributionStats = (calendar) => {
  const days = normalizeContributionDays(calendar)

  return {
    totalContributions: calculateTotalContributions(days),
    currentStreak: calculateCurrentStreak(days),
    longestStreak: calculateLongestStreak(days),
  }
}

export default getContributionStats
