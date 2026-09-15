import { addIsoDays } from "./contributionCalendar.js"

const isPreviousDay = (previous, current) => (
  addIsoDays(previous.date, 1) === current.date
)

export const calculateTotalContributions = (days) => (
  days.reduce(
    (total, day) => total + day.contributionCount,
    0
  )
)

export const calculateLongestStreak = (days) => {
  let longest = 0
  let active = 0
  let previous = null

  for (const day of days) {
    if (
      day.contributionCount > 0 &&
      (!previous || isPreviousDay(previous, day))
    ) {
      active += 1
    } else if (day.contributionCount > 0) {
      active = 1
    } else {
      active = 0
    }

    longest = Math.max(longest, active)
    previous = day
  }

  return longest
}

export const getCurrentStreakDays = (days) => {
  if (!days.length) return []

  let index = days.length - 1

  // The range ends today. A zero today means a streak can still
  // be current if yesterday was active.
  if (days[index].contributionCount === 0) {
    index -= 1
  }

  if (index < 0 || days[index].contributionCount === 0) {
    return []
  }

  const streak = [days[index]]

  for (
    let cursor = index - 1;
    cursor >= 0;
    cursor -= 1
  ) {
    const day = days[cursor]
    const laterDay = streak[streak.length - 1]

    if (
      day.contributionCount === 0 ||
      !isPreviousDay(day, laterDay)
    ) {
      break
    }

    streak.push(day)
  }

  return streak.reverse()
}

export const calculateCurrentStreak = (days) => (
  getCurrentStreakDays(days).length
)

export const calculateMostActiveWeekday = (days) => {
  const weekdayTotals = new Map()

  for (const day of days) {
    if (day.contributionCount <= 0) continue

    const current = weekdayTotals.get(day.weekday) || 0

    weekdayTotals.set(
      day.weekday,
      current + day.contributionCount
    )
  }

  let mostActiveWeekday = null
  let maxContributions = 0

  for (const [weekday, contributions] of weekdayTotals) {
    if (contributions > maxContributions) {
      maxContributions = contributions
      mostActiveWeekday = weekday
    }
  }

  return {
    weekday: mostActiveWeekday,
    contributions: maxContributions,
  }
}

export const calculateMonthlyContributions = (days) => {
  const monthTotals = new Map()

  for (const day of days) {
    const month = day.date.slice(0, 7)
    const current = monthTotals.get(month) || 0

    monthTotals.set(
      month,
      current + day.contributionCount
    )
  }

  return [...monthTotals.entries()]
    .sort(([firstMonth], [secondMonth]) => (
      firstMonth.localeCompare(secondMonth)
    ))
    .map(([month, contributions]) => ({
      month,
      contributions,
    }))
}

export const calculateMostActiveMonth = (days) => {
  const monthContributions =
    calculateMonthlyContributions(days)

  let mostActiveMonth = null
  let maxContributions = 0

  for (const { month, contributions } of monthContributions) {
    if (contributions > maxContributions) {
      maxContributions = contributions
      mostActiveMonth = month
    }
  }

  return {
    month: mostActiveMonth,
    contributions: maxContributions,
  }
}

export const calculateWeekdayContributionRatio = (days) => {
  let totalContributions = 0
  let weekdayContributions = 0

  for (const day of days) {
    const contributions = day.contributionCount

    if (contributions <= 0) continue

    totalContributions += contributions

    if (day.weekday >= 1 && day.weekday <= 5) {
      weekdayContributions += contributions
    }
  }

  return totalContributions
    ? weekdayContributions / totalContributions
    : 0
}

export const calculateLongestContributionGap = (days) => {
  let longestGap = 0
  let currentGap = 0

  for (const day of days) {
    if (day.contributionCount === 0) {
      currentGap += 1
      longestGap = Math.max(
        longestGap,
        currentGap
      )
    } else {
      currentGap = 0
    }
  }

  return longestGap
}