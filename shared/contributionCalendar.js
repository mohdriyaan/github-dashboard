/**
 * Contribution dates are ISO calendar dates in UTC. After the API boundary,
 * weekday values follow this application's convention: 1 = Monday through 7
 * = Sunday.
 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const assertIsoDate = (date) => {
  if (!ISO_DATE.test(date)) {
    throw new TypeError(`Expected an ISO date, received ${date}`)
  }
}

const toUtcDate = (date) => {
  assertIsoDate(date)
  const [year, month, day] = date.split("-").map(Number)

  return new Date(Date.UTC(year, month - 1, day))
}

const toIsoDate = (date) => date.toISOString().slice(0, 10)

/** GitHub's raw GraphQL value is 0 for Sunday and 1–6 for Monday–Saturday. */
export const toMondayFirstWeekday = (githubWeekday) => {
  if (!Number.isInteger(githubWeekday) || githubWeekday < 0 || githubWeekday > 6) {
    throw new TypeError(`Expected GitHub weekday 0–6, received ${githubWeekday}`)
  }

  return githubWeekday === 0 ? 7 : githubWeekday
}

/**
 * The API boundary converts GitHub's Sunday-zero weekday to the application's
 * Monday-first contract. Consumers never need to understand both conventions.
 */
export const normalizeGithubContributionCalendar = (calendar) => ({
  ...calendar,
  weeks: (calendar?.weeks ?? []).map((week) => ({
    ...week,
    contributionDays: (week.contributionDays ?? []).map((day) => ({
      ...day,
      weekday: toMondayFirstWeekday(day.weekday),
    })),
  })),
})

export const addIsoDays = (date, amount) => {
  const value = toUtcDate(date)
  value.setUTCDate(value.getUTCDate() + amount)

  return toIsoDate(value)
}

export const getIsoWeekday = (date) => {
  const weekday = toUtcDate(date).getUTCDay()

  return weekday === 0 ? 7 : weekday
}

export const getMondayStart = (date, weekday = getIsoWeekday(date)) => {
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new TypeError(`Expected weekday 1–7, received ${weekday}`)
  }

  return addIsoDays(date, -(weekday - 1))
}

export const normalizeContributionDays = (calendar) => {
  const daysByDate = new Map()

  for (const week of calendar?.weeks ?? []) {
    for (const day of week.contributionDays ?? []) {
      if (!day?.date) {
        throw new TypeError("Contribution day is missing an ISO date")
      }

      assertIsoDate(day.date)
      const weekday = Number.isInteger(day.weekday) && day.weekday >= 1 && day.weekday <= 7
        ? day.weekday
        : getIsoWeekday(day.date)

      daysByDate.set(day.date, {
        ...day,
        weekday,
        contributionCount: Number(day.contributionCount) || 0,
      })
    }
  }

  return [...daysByDate.values()].sort((first, second) => (
    first.date.localeCompare(second.date)
  ))
}

/**
 * The sole rendering view model: columns are Monday-start weeks and rows are
 * GitHub's authoritative weekday values minus one. Partial weeks retain null
 * slots; no contribution day is manufactured or moved.
 */
export const createContributionCalendarView = (calendar) => {
  const weeksByStart = new Map()
  const days = normalizeContributionDays(calendar)

  for (const day of days) {
    const weekStart = getMondayStart(day.date, day.weekday)

    if (!weeksByStart.has(weekStart)) {
      weeksByStart.set(weekStart, Array(7).fill(null))
    }

    weeksByStart.get(weekStart)[day.weekday - 1] = day
  }

  const weeks = [...weeksByStart.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([weekStart, days]) => ({ weekStart, days }))

  const weekIndexByStart = new Map(
    weeks.map(({ weekStart }, index) => [weekStart, index])
  )

  const months = (calendar?.months ?? [])
    .map((month) => ({
      ...month,
      weekIndex: weekIndexByStart.get(getMondayStart(month.firstDay)),
    }))
    .filter((month) => month.weekIndex !== undefined)
    .map((month) => ({
      key: month.firstDay,
      label: month.name.slice(0, 3),
      weekIndex: month.weekIndex,
    }))

  return { days, weeks, months }
}
