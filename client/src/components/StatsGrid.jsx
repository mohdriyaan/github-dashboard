import { Star, GitFork, Code2 } from "lucide-react"

const StatsGrid = ({ stats }) => {
  return (
    <section className="border-y border-border py-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="inline-flex items-center gap-3">
          <Star className="size-5 text-muted-foreground" />

          <span className="font-mono text-xl font-semibold tabular-nums">
            {stats?.totalStars ?? 0}
          </span>

          <span className="text-base text-muted-foreground">
            Stars
          </span>
        </div>

        <div className="inline-flex items-center gap-3">
          <GitFork className="size-5 text-muted-foreground" />

          <span className="font-mono text-xl font-semibold tabular-nums">
            {stats?.totalForks ?? 0}
          </span>

          <span className="text-base text-muted-foreground">
            Forks
          </span>
        </div>

        <div className="inline-flex items-center gap-3">
          <Code2 className="size-5 text-muted-foreground" />

          <span className="font-mono text-xl font-semibold">
            {stats?.mostUsedLanguage || "Not specified"}
          </span>

          <span className="text-base text-muted-foreground">
            Most used language
          </span>
        </div>
      </div>
    </section>
  )
}

export default StatsGrid