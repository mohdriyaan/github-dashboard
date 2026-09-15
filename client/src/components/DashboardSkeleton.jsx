import { Skeleton } from "@/components/ui/skeleton"
import { ActivityGraphSkeleton } from "./ActivityGraph.jsx"

const DashboardSkeleton = () => {
  return (
    <div className="space-y-12">
      {/* ProfileHero skeleton */}
      <section className="space-y-6">
        <div className="flex items-start gap-5">
          <Skeleton className="size-24 shrink-0 rounded-full" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-full max-w-2xl" />

            <div className="flex gap-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <Skeleton className="h-9 w-36 shrink-0 rounded-md" />
        </div>

        <Skeleton className="h-px w-full" />
      </section>

      <ActivityGraphSkeleton />

      {/* StatRail skeleton */}
      <section className="border-y border-border py-5">
        <div className="flex gap-10">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-44" />
        </div>
      </section>

      {/* RepositoryList skeleton */}
      <section className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="divide-y divide-border border-y border-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="space-y-4 py-7"
            >
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-5 w-full max-w-4xl" />

              <div className="flex gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardSkeleton
