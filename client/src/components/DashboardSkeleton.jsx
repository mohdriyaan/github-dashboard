import { Skeleton } from "@/components/ui/skeleton"

import { ActivityGraphSkeleton } from "./ActivityGraph.jsx"

const DashboardSkeleton = () => {
  return (
    <div
      aria-label="Loading GitHub profile"
      className="space-y-12 sm:space-y-14"
    >
      {/* ProfileHero skeleton */}
      <section
        aria-label="Loading profile information"
        className="space-y-6"
      >
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />

            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-8 w-48 sm:h-9 sm:w-72" />

              <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />

              <Skeleton className="h-4 w-full max-w-2xl sm:h-5" />

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>

          <Skeleton className="h-9 w-28 rounded-md sm:w-36" />
        </div>

        <Skeleton className="h-px w-full" />
      </section>

      {/* Contribution activity skeleton */}
      <ActivityGraphSkeleton />

      {/* StatRail skeleton */}
      <section
        aria-label="Loading repository statistics"
        className="border-y border-border py-5"
      >
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-44" />
        </div>
      </section>

      {/* RepositoryList skeleton */}
      <section
        aria-label="Loading repositories"
        className="space-y-5"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-40 sm:h-9 sm:w-48" />
          <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
        </div>

        <div className="divide-y divide-border border-y border-border">
          {Array.from({ length: 4 }).map((_, index) => (
            <article
              key={index}
              className="space-y-4 py-6 sm:py-7"
            >
              <Skeleton className="h-5 w-48 sm:h-6 sm:w-56" />

              <Skeleton className="h-4 w-full max-w-4xl sm:h-5" />

              <div className="flex flex-wrap gap-x-6 gap-y-2">
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