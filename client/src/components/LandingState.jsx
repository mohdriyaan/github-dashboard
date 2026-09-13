import { FolderGit2 } from "lucide-react"

const LandingState = () => {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <FolderGit2
        className="size-8 text-muted-foreground"
        aria-hidden="true"
      />

      <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
        Explore a GitHub profile
      </h2>

      <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
        Search for a GitHub username above to explore repositories,
        contribution activity, and profile statistics.
      </p>
    </section>
  )
}

export default LandingState