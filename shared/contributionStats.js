import { addIsoDays } from "./contributionCalendar.js"

const isPreviousDay = (previous, current) => (
  addIsoDays(previous.date, 1) === current.date
)

export const calculateTotalContributions = (days) => (
  days.reduce((total, day) => total + day.contributionCount, 0)
)

export const calculateLongestStreak = (days) => {
  let longest = 0
  let active = 0
  let previous = null

  for (const day of days) {
    if (day.contributionCount > 0 && (!previous || isPreviousDay(previous, day))) {
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

  // The range ends today. A zero today means a streak can still be current if
  // yesterday was active; two trailing zeroes correctly produce no streak.
  if (days[index].contributionCount === 0) index -= 1
  if (index < 0 || days[index].contributionCount === 0) return []

  const streak = [days[index]]

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const day = days[cursor]
    const laterDay = streak[streak.length - 1]

    if (day.contributionCount === 0 || !isPreviousDay(day, laterDay)) break

    streak.push(day)
  }

  return streak.reverse()
}

export const calculateCurrentStreak = (days) => getCurrentStreakDays(days).length
