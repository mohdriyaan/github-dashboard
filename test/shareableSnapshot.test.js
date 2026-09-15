import test from "node:test"
import assert from "node:assert/strict"

import {
  createShareableSnapshot,
} from "../shared/shareableSnapshot.js"

const baseStats = {
  totalContributions: 3697,
  currentStreak: 77,
  longestStreak: 80,
}

const baseInsights = {
  mostActiveWeekday: {
    weekday: 4,
    contributions: 749,
  },
  mostActiveMonth: {
    month: "2026-08",
    contributions: 596,
  },
  monthlyContributions: [],
  weekdayContributionRatio: 0.77,
  weekendContributionRatio: 0.23,
  longestContributionGap: 1,
  historyMonthCount: 12,
  activityArchetype: "Steady Committer",
  publicActivityDisclaimer:
    "Based on public activity only.",
}

test("creates a shareable snapshot from profile, stats, and insights", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
      name: "The Octocat",
    },
    stats: baseStats,
    insights: baseInsights,
  })

  assert.equal(
    snapshot.type,
    "github-activity-snapshot"
  )

  assert.equal(snapshot.version, 1)

  assert.deepEqual(snapshot.profile, {
    username: "octocat",
    name: "The Octocat",
  })

  assert.deepEqual(snapshot.stats, baseStats)

  assert.deepEqual(snapshot.insights, {
    mostActiveWeekday: baseInsights.mostActiveWeekday,
    mostActiveMonth: baseInsights.mostActiveMonth,
    weekdayContributionRatio:
      baseInsights.weekdayContributionRatio,
    weekendContributionRatio:
      baseInsights.weekendContributionRatio,
    longestContributionGap:
      baseInsights.longestContributionGap,
    historyMonthCount:
      baseInsights.historyMonthCount,
    activityArchetype:
      baseInsights.activityArchetype,
    publicActivityDisclaimer:
      baseInsights.publicActivityDisclaimer,
  })

  assert.equal(
    typeof snapshot.createdAt,
    "string"
  )

  assert.ok(
    !Number.isNaN(
      Date.parse(snapshot.createdAt)
    )
  )
})

test("falls back to login when profile name is missing", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
    },
    stats: baseStats,
    insights: baseInsights,
  })

  assert.deepEqual(snapshot.profile, {
    username: "octocat",
    name: "octocat",
  })
})

test("normalizes invalid numeric stats to zero", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
      name: "Octocat",
    },
    stats: {
      totalContributions: "invalid",
      currentStreak: null,
      longestStreak: undefined,
    },
    insights: baseInsights,
  })

  assert.deepEqual(snapshot.stats, {
    totalContributions: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
})

test("uses safe defaults for missing insight values", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
    },
    stats: {},
    insights: {},
  })

  assert.equal(
    snapshot.insights.mostActiveWeekday,
    null
  )

  assert.equal(
    snapshot.insights.mostActiveMonth,
    null
  )

  assert.equal(
    snapshot.insights.weekdayContributionRatio,
    0
  )

  assert.equal(
    snapshot.insights.weekendContributionRatio,
    0
  )

  assert.equal(
    snapshot.insights.longestContributionGap,
    0
  )

  assert.equal(
    snapshot.insights.historyMonthCount,
    0
  )

  assert.equal(
    snapshot.insights.activityArchetype,
    "Consistent Contributor"
  )
})

test("always includes the public activity disclaimer", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
    },
    stats: {},
    insights: {},
  })

  assert.equal(
    snapshot.insights.publicActivityDisclaimer,
    "Based on public activity only."
  )
})

test("uses version 1 for the snapshot schema", () => {
  const snapshot = createShareableSnapshot({
    profile: {
      login: "octocat",
    },
    stats: baseStats,
    insights: baseInsights,
  })

  assert.equal(snapshot.version, 1)
})