import { FolderGit2 } from "lucide-react"

const EmptyState = ({
  icon: Icon = FolderGit2,
  title,
  description,
}) => {
  return (
    <section className="flex flex-col items-center justify-center border-y border-border py-12 text-center">
      <Icon
        className="size-6 text-muted-foreground"
        aria-hidden="true"
      />

      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  )
}

export default EmptyState