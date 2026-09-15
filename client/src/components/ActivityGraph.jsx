import { useMemo, useState } from "react"

import {
  createContributionCalendarView,
} from "../../../shared/contributionCalendar.js"
import { getCurrentStreakDays } from "../../../shared/contributionStats.js"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const GRAPH = {
  cellSize: 11,
  gap: 3,
  labelWidth: 28,
  monthRowHeight: 19,
  monthEndPadding: 24,
  weekCount: 53,
}

const COMPACT_GRAPH = {
  ...GRAPH,
  cellSize: 7,
  gap: 2,
  labelWidth: 18,
  monthRowHeight: 12,
  monthEndPadding: 12,
}

const DAY_LABELS = [
  { label: "M", row: 0 },
  { label: "W", row: 2 },
  { label: "F", row: 4 },
]

const SKELETON_MONTH_COUNT = 12

const CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

const getCellX = (weekIndex, graph = GRAPH) => (
  graph.labelWidth +
  weekIndex * (graph.cellSize + graph.gap)
)

const getCellY = (rowIndex, graph = GRAPH) => (
  graph.monthRowHeight +
  rowIndex * (graph.cellSize + graph.gap)
)

const getGraphWidth = (weekCount, graph = GRAPH) => (
  graph.labelWidth +
  weekCount * graph.cellSize +
  Math.max(weekCount - 1, 0) * graph.gap +
  graph.monthEndPadding
)

const getGraphHeight = (graph = GRAPH) => (
  graph.monthRowHeight +
  7 * graph.cellSize +
  6 * graph.gap
)

const getSkeletonMonthWeeks = () => (
  Array.from({ length: SKELETON_MONTH_COUNT }, (_, monthIndex) => (
    Math.round(
      monthIndex * GRAPH.weekCount / SKELETON_MONTH_COUNT
    )
  ))
)

const getContributionLabel = (day) => (
  `${day.contributionCount} ${
    day.contributionCount === 1
      ? "contribution"
      : "contributions"
  } on ${day.date}`
)

const ContributionTooltip = ({ day, children }) => (
  <Tooltip>
    <TooltipTrigger render={children} />

    <TooltipContent
      side="top"
      align="center"
      sideOffset={8}
      className="border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-zinc-100 shadow-none"
    >
      <p className="text-xs font-medium leading-4">
        {getContributionLabel(day)}
      </p>
    </TooltipContent>
  </Tooltip>
)

const GraphAxes = ({
  months = [],
  skeleton = false,
  graph = GRAPH,
}) => (
  <>
    {skeleton
      ? getSkeletonMonthWeeks().map((weekIndex) => (
        <rect
          key={weekIndex}
          x={getCellX(weekIndex, graph)}
          y={5}
          width={20}
          height={5}
          rx={2}
          className="fill-muted"
        />
      ))
      : months.map(({ key, label, weekIndex }) => (
        <text
          key={key}
          x={getCellX(weekIndex, graph)}
          y={graph === COMPACT_GRAPH ? 9 : 12}
          dominantBaseline="alphabetic"
          aria-hidden="true"
          className={
            graph === COMPACT_GRAPH
              ? "fill-muted-foreground font-mono text-[8px] font-medium"
              : "fill-muted-foreground font-mono text-[11px] font-medium"
          }
        >
          {label}
        </text>
      ))}

    {DAY_LABELS.map(({ label, row }) => (
      <text
        key={label}
        x={graph.labelWidth / 2}
        y={
          getCellY(row, graph) +
          graph.cellSize / 2
        }
        dominantBaseline="middle"
        textAnchor="middle"
        aria-hidden="true"
        className={
          graph === COMPACT_GRAPH
            ? "fill-muted-foreground font-mono text-[8px] font-medium"
            : "fill-muted-foreground font-mono text-[10px] font-medium"
        }
      >
        {label}
      </text>
    ))}
  </>
)

export const ActivityGraphSkeleton = ({ compact = false }) => {
  const graph = compact
    ? COMPACT_GRAPH
    : GRAPH

  const graphWidth = getGraphWidth(
    graph.weekCount,
    graph
  )

  const graphHeight = getGraphHeight(graph)

  return (
    <section
      aria-label="Loading contribution activity"
      className={
        compact
          ? "space-y-4"
          : "max-w-[840px] space-y-6"
      }
    >
      <div
        className={
          compact
            ? "space-y-2"
            : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
        }
      >
        <div className="space-y-2">
          <div
            className={
              compact
                ? "h-5 w-24 animate-pulse rounded bg-muted"
                : "h-9 w-64 animate-pulse rounded bg-muted"
            }
          />

          <div
            className={
              compact
                ? "h-4 w-20 animate-pulse rounded bg-muted"
                : "h-5 w-48 animate-pulse rounded bg-muted"
            }
          />
        </div>

        {!compact && (
          <div className="space-y-2 sm:text-right">
            <div className="h-10 w-16 animate-pulse rounded bg-muted sm:ml-auto" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted sm:ml-auto" />
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <svg
          width={graphWidth}
          height={graphHeight}
          viewBox={`0 0 ${graphWidth} ${graphHeight}`}
          aria-hidden="true"
          className="block animate-pulse"
        >
          <GraphAxes
            skeleton
            graph={graph}
          />

          {Array.from(
            { length: graph.weekCount },
            (_, weekIndex) => (
              Array.from(
                { length: 7 },
                (_, rowIndex) => (
                  <rect
                    key={`${weekIndex}-${rowIndex}`}
                    x={getCellX(
                      weekIndex,
                      graph
                    )}
                    y={getCellY(
                      rowIndex,
                      graph
                    )}
                    width={graph.cellSize}
                    height={graph.cellSize}
                    rx={2}
                    className="fill-muted"
                  />
                )
              )
            )
          )}
        </svg>
      </div>
    </section>
  )
}

const ActivityGraph = ({
  calendar,
  stats,
  isLoading,
  compact = false,
}) => {
  const [focusedDate, setFocusedDate] = useState(null)

  const graph = compact
    ? COMPACT_GRAPH
    : GRAPH

  const view = useMemo(
    () => createContributionCalendarView(calendar),
    [calendar]
  )

  const currentStreakDates = useMemo(
    () => (
      new Set(
        getCurrentStreakDays(view.days)
          .map(({ date }) => date)
      )
    ),
    [view.days]
  )

  if (isLoading) {
    return (
      <ActivityGraphSkeleton
        compact={compact}
      />
    )
  }

  if (!view.weeks.length) {
    return null
  }

  const graphWidth = getGraphWidth(
    view.weeks.length,
    graph
  )

  const graphHeight = getGraphHeight(graph)

  return (
    <section
      aria-labelledby={
        compact
          ? undefined
          : "contribution-activity-heading"
      }
      className={
        compact
          ? "space-y-4"
          : "max-w-[840px] space-y-6"
      }
    >
      <div
        className={
          compact
            ? "space-y-2"
            : "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8"
        }
      >
        <div className="space-y-2">
          <h2
            id={
              compact
                ? undefined
                : "contribution-activity-heading"
            }
            className={
              compact
                ? "text-lg font-semibold tracking-tight"
                : "text-3xl font-semibold tracking-tight sm:text-4xl"
            }
          >
            {compact
              ? "Activity"
              : "Contribution activity"}
          </h2>

          <p className="text-sm text-muted-foreground">
            <span className="font-mono tabular-nums">
              {stats?.totalContributions ?? 0}
            </span>{" "}
            contributions
            {!compact && " · last year"}
          </p>
        </div>

        {!compact && (
          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl">
              {stats?.currentStreak ?? 0}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              day streak
            </p>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-max">
          <svg
            width={graphWidth}
            height={graphHeight}
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            role="group"
            aria-labelledby={
              compact
                ? undefined
                : "contribution-graph-title contribution-graph-description"
            }
            aria-label={
              compact
                ? "Contribution activity for the last year"
                : undefined
            }
            className="block"
          >
            {!compact && (
              <>
                <title id="contribution-graph-title">
                  Contribution activity for the last year
                </title>

                <desc id="contribution-graph-description">
                  A Monday-to-Sunday calendar heatmap showing
                  daily contribution activity across the last year.
                </desc>
              </>
            )}

            <GraphAxes
              months={view.months}
              graph={graph}
            />

            {view.weeks.map(({ days }, weekIndex) => (
              days.map((day, rowIndex) => {
                if (!day) return null

                const isFocused =
                  focusedDate === day.date

                const isCurrentStreak =
                  currentStreakDates.has(day.date)

                const level =
                  CONTRIBUTION_LEVELS[
                    day.contributionLevel
                  ] ?? 0

                const stroke = isFocused
                  ? "var(--ring)"
                  : isCurrentStreak
                    ? "var(--primary)"
                    : "var(--border)"

                return (
                  <ContributionTooltip
                    key={day.date}
                    day={day}
                  >
                    <rect
                      x={getCellX(
                        weekIndex,
                        graph
                      )}
                      y={getCellY(
                        rowIndex,
                        graph
                      )}
                      width={graph.cellSize}
                      height={graph.cellSize}
                      rx={2}
                      fill={`var(--contrib-${level})`}
                      stroke={stroke}
                      strokeWidth={
                        isFocused ||
                        isCurrentStreak
                          ? compact
                            ? 1
                            : 1.5
                          : 0.75
                      }
                      tabIndex={0}
                      role="img"
                      aria-label={getContributionLabel(day)}
                      className="cursor-default outline-none transition-[filter] duration-150 hover:brightness-110 focus-visible:brightness-110"
                      onFocus={() =>
                        setFocusedDate(day.date)
                      }
                      onBlur={() =>
                        setFocusedDate(null)
                      }
                    />
                  </ContributionTooltip>
                )
              })
            ))}
          </svg>

          {!compact && (
            <div className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <p>
                Longest streak ·{" "}
                <span className="font-mono tabular-nums">
                  {stats?.longestStreak ?? 0}
                </span>{" "}
                days
              </p>

              <div
                className="flex shrink-0 items-center gap-2"
                aria-label="Contribution intensity legend: less to more activity"
              >
                <span>Less</span>

                <div
                  className="flex items-center gap-[2px]"
                  aria-hidden="true"
                >
                  {[0, 1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className="size-[11px] rounded-[2px] ring-1 ring-inset ring-border"
                      style={{
                        backgroundColor:
                          `var(--contrib-${level})`,
                      }}
                    />
                  ))}
                </div>

                <span>More</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ActivityGraph