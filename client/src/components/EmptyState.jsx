import { FolderGit2 } from "lucide-react"

const EmptyState = ({
  icon: Icon = FolderGit2,
  title,
  description,
}) => {
  return (
    <section
      aria-label={title}
      className="flex min-h-56 flex-col items-center justify-center border-y border-border px-4 py-12 text-center sm:min-h-64 sm:py-14"
    >
      <Icon
        className="size-6 text-muted-foreground"
        aria-hidden="true"
      />

      <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  )
}

export default EmptyState