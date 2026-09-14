import assert from "node:assert/strict"
import test from "node:test"

import {
  createContributionCalendarView,
  getIsoWeekday,
  normalizeGithubContributionCalendar,
  normalizeContributionDays,
} from "../shared/contributionCalendar.js"
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateTotalContributions,
  getCurrentStreakDays,
} from "../shared/contributionStats.js"

const day = (date, contributionCount = 0) => ({
  date,
  contributionCount,
  weekday: getIsoWeekday(date),
  contributionLevel: contributionCount > 0 ? "FIRST_QUARTILE" : "NONE",
})

const calendar = (dates, months = []) => ({
  weeks: [{ contributionDays: dates }],
  months,
})

test("normalizes a full Monday-to-Sunday week into seven fixed rows", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-09-07"), day("2026-09-08"), day("2026-09-09"),
    day("2026-09-10"), day("2026-09-11"), day("2026-09-12"),
    day("2026-09-13"),
  ]))

  assert.equal(view.weeks.length, 1)
  assert.equal(view.weeks[0].weekStart, "2026-09-07")
  assert.deepEqual(view.weeks[0].days.map(({ date }) => date), [
    "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10",
    "2026-09-11", "2026-09-12", "2026-09-13",
  ])
})

test("converts GitHub's raw Sunday-zero weekday once at the API boundary", () => {
  const normalized = normalizeGithubContributionCalendar({
    weeks: [{ contributionDays: [
      { date: "2026-09-13", contributionCount: 1, weekday: 0 },
      { date: "2026-09-14", contributionCount: 1, weekday: 1 },
    ] }],
  })

  assert.deepEqual(
    normalized.weeks[0].contributionDays.map(({ weekday }) => weekday),
    [7, 1]
  )
})

test("derives an ISO weekday when normalized weekday data is missing or malformed", () => {
  const days = normalizeContributionDays({
    weeks: [{ contributionDays: [
      { date: "2026-09-14", contributionCount: 1 },
      { date: "2026-09-13", contributionCount: 1, weekday: 0 },
    ] }],
  })

  assert.deepEqual(days.map(({ date, weekday }) => ({ date, weekday })), [
    { date: "2026-09-13", weekday: 7 },
    { date: "2026-09-14", weekday: 1 },
  ])
  assert.throws(
    () => normalizeContributionDays({ weeks: [{ contributionDays: [{ contributionCount: 1 }] }] }),
    /missing an ISO date/
  )
})

test("keeps an exact partial first week in its Monday-start column", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-09-01"), day("2026-09-02"), day("2026-09-03"),
    day("2026-09-04"), day("2026-09-05"), day("2026-09-06"),
  ]))

  assert.deepEqual(view.weeks[0].days.map((value) => value?.date ?? null), [
    null, "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06",
  ])
})

test("keeps an exact partial final week in its Monday-start column", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-09-07"), day("2026-09-08"), day("2026-09-09"), day("2026-09-10"),
  ]))

  assert.deepEqual(view.weeks[0].days.map((value) => value?.date ?? null), [
    "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10", null, null, null,
  ])
})

test("places Sunday and the following Monday in different columns", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-09-13", 21),
    day("2026-09-14", 8),
  ]))

  assert.equal(view.weeks[0].weekStart, "2026-09-07")
  assert.equal(view.weeks[0].days[6].date, "2026-09-13")
  assert.equal(view.weeks[1].weekStart, "2026-09-14")
  assert.equal(view.weeks[1].days[0].date, "2026-09-14")
})

test("positions a month beginning Monday at that Monday's visual week", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-05-31"), day("2026-06-01"), day("2026-06-02"),
  ], [{ firstDay: "2026-06-01", name: "June", totalWeeks: 5, year: 2026 }]))

  assert.deepEqual(view.months, [{ key: "2026-06-01", label: "Jun", weekIndex: 1 }])
})

const MONTH_START_CASES = [
  ["Tuesday", "2026-09-01", "2026-08-31", "September"],
  ["Wednesday", "2027-09-01", "2027-08-30", "September"],
  ["Thursday", "2026-10-01", "2026-09-28", "October"],
  ["Friday", "2027-01-01", "2026-12-28", "January"],
  ["Saturday", "2027-05-01", "2027-04-26", "May"],
  ["Sunday", "2027-08-01", "2027-07-26", "August"],
]

for (const [weekdayName, firstDay, weekStart, name] of MONTH_START_CASES) {
  test(`positions a month starting ${weekdayName} in the containing visual week`, () => {
    const view = createContributionCalendarView(calendar([
      day(firstDay),
    ], [{ firstDay, name, totalWeeks: 5, year: Number(firstDay.slice(0, 4)) }]))

    assert.equal(view.weeks[0].weekStart, weekStart)
    assert.deepEqual(view.months, [{
      key: firstDay,
      label: name.slice(0, 3),
      weekIndex: 0,
    }])
  })
}

test("positions a month beginning mid-week and across a year boundary", () => {
  const view = createContributionCalendarView(calendar([
    day("2026-12-30"), day("2026-12-31"), day("2027-01-01"), day("2027-01-02"),
  ], [{ firstDay: "2027-01-01", name: "January", totalWeeks: 5, year: 2027 }]))

  assert.deepEqual(view.months, [{ key: "2027-01-01", label: "Jan", weekIndex: 0 }])
})

test("handles one-day and zero-contribution calendars", () => {
  const oneDay = normalizeContributionDays(calendar([day("2026-09-14", 3)]))
  const empty = normalizeContributionDays(calendar([day("2026-09-14", 0)]))

  assert.equal(calculateTotalContributions(oneDay), 3)
  assert.equal(calculateCurrentStreak(oneDay), 1)
  assert.equal(calculateLongestStreak(oneDay), 1)
  assert.equal(calculateTotalContributions(empty), 0)
  assert.equal(calculateCurrentStreak(empty), 0)
  assert.equal(calculateLongestStreak(empty), 0)
})

test("calculates a current streak across Sunday to Monday", () => {
  const days = normalizeContributionDays(calendar([
    day("2026-09-12", 1), day("2026-09-13", 1), day("2026-09-14", 1),
  ]))

  assert.equal(calculateCurrentStreak(days), 3)
  assert.deepEqual(getCurrentStreakDays(days).map(({ date }) => date), [
    "2026-09-12", "2026-09-13", "2026-09-14",
  ])
})

test("handles a current streak ending on Sunday, Monday, or no active day", () => {
  const sunday = normalizeContributionDays(calendar([
    day("2026-09-12", 1), day("2026-09-13", 1),
  ]))
  const monday = normalizeContributionDays(calendar([
    day("2026-09-13", 1), day("2026-09-14", 1),
  ]))
  const zero = normalizeContributionDays(calendar([
    day("2026-09-13", 0), day("2026-09-14", 0),
  ]))

  assert.equal(calculateCurrentStreak(sunday), 2)
  assert.equal(calculateCurrentStreak(monday), 2)
  assert.equal(calculateCurrentStreak(zero), 0)
})

test("keeps yesterday's streak current when today has zero contributions", () => {
  const days = normalizeContributionDays(calendar([
    day("2026-09-12", 0), day("2026-09-13", 4), day("2026-09-14", 0),
  ]))

  assert.equal(calculateCurrentStreak(days), 1)
  assert.deepEqual(getCurrentStreakDays(days).map(({ date }) => date), ["2026-09-13"])
})

test("calculates the longest consecutive active run independently of the current streak", () => {
  const days = normalizeContributionDays(calendar([
    day("2026-09-07", 1), day("2026-09-08", 1), day("2026-09-09", 0),
    day("2026-09-10", 1), day("2026-09-11", 1), day("2026-09-12", 1),
    day("2026-09-13", 0), day("2026-09-14", 0),
  ]))

  assert.equal(calculateLongestStreak(days), 3)
  assert.equal(calculateCurrentStreak(days), 0)
})

test("sorts malformed API week ordering before total and streak calculations", () => {
  const days = normalizeContributionDays({
    weeks: [
      { contributionDays: [day("2026-09-15", 1), day("2026-09-13", 1)] },
      { contributionDays: [day("2026-09-14", 1), day("2026-09-12", 0)] },
    ],
  })

  assert.deepEqual(days.map(({ date }) => date), [
    "2026-09-12", "2026-09-13", "2026-09-14", "2026-09-15",
  ])
  assert.equal(calculateTotalContributions(days), 3)
  assert.equal(calculateCurrentStreak(days), 3)
  assert.equal(calculateLongestStreak(days), 3)
})
