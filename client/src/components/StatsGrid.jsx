import { Star, GitFork, Code2 } from "lucide-react"

const StatsGrid = ({ stats }) => {
  return (
    <section className="border-y border-border py-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-10">
        <div className="inline-flex shrink-0 items-center gap-3">
          <Star
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />

          <span className="font-mono text-lg font-semibold tabular-nums sm:text-xl">
            {stats?.totalStars ?? 0}
          </span>

          <span className="text-sm text-muted-foreground sm:text-base">
            Stars
          </span>
        </div>

        <div className="inline-flex shrink-0 items-center gap-3">
          <GitFork
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />

          <span className="font-mono text-lg font-semibold tabular-nums sm:text-xl">
            {stats?.totalForks ?? 0}
          </span>

          <span className="text-sm text-muted-foreground sm:text-base">
            Forks
          </span>
        </div>

        <div className="inline-flex min-w-0 items-center gap-3">
          <Code2
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />

          <span className="min-w-0 max-w-full truncate font-mono text-lg font-semibold sm:text-xl">
            {stats?.mostUsedLanguage || "Not specified"}
          </span>

          <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground sm:text-base">
            Most used language
          </span>
        </div>
      </div>
    </section>
  )
}

export default StatsGrid