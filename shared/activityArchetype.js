const ARCHETYPE_THRESHOLDS = {
  sprintCoder: {
    minimumContributions: 50,
    minimumMonths: 6,
    topMonthsShare: 0.7,
  },

  weekendWarrior: {
    minimumContributions: 20,
    weekendShare: 0.4,
  },

  steadyCommitter: {
    minimumStreak: 30,
  },
}

export const determineActivityArchetype = ({
  totalContributions,
  monthContributions,
  weekdayContributionRatio,
  currentStreak,
  longestStreak,
}) => {
  const total = Number(totalContributions) || 0
  const months = Array.isArray(monthContributions)
    ? monthContributions
    : []

  const weekdayRatio =
    Number.isFinite(Number(weekdayContributionRatio))
      ? Number(weekdayContributionRatio)
      : 0

  const streaks = [
    Number(currentStreak) || 0,
    Number(longestStreak) || 0,
  ]

  // 1. Sprint Coder
  if (
    total >= ARCHETYPE_THRESHOLDS.sprintCoder.minimumContributions &&
    months.length >= ARCHETYPE_THRESHOLDS.sprintCoder.minimumMonths
  ) {
    const topThreeContributions = months
      .map((entry) => Number(entry?.contributions) || 0)
      .sort((first, second) => second - first)
      .slice(0, 3)
      .reduce((sum, contributions) => sum + contributions, 0)

    const topMonthsShare = total
      ? topThreeContributions / total
      : 0

    if (
      topMonthsShare >=
      ARCHETYPE_THRESHOLDS.sprintCoder.topMonthsShare
    ) {
      return "Sprint Coder"
    }
  }

  // 2. Weekend Warrior
  const weekendShare = 1 - weekdayRatio

  if (
    total >= ARCHETYPE_THRESHOLDS.weekendWarrior.minimumContributions &&
    weekendShare > ARCHETYPE_THRESHOLDS.weekendWarrior.weekendShare
  ) {
    return "Weekend Warrior"
  }

  // 3. Steady Committer
  const strongestStreak = Math.max(...streaks)

  if (
    strongestStreak >=
    ARCHETYPE_THRESHOLDS.steadyCommitter.minimumStreak
  ) {
    return "Steady Committer"
  }

  // 4. Fallback
  return "Consistent Contributor"
}