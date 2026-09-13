import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

const ErrorState = ({
  icon: Icon = TriangleAlert,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <section className="flex flex-col items-center justify-center border-y border-border py-12 text-center">
      <Icon
        className="size-6 text-destructive"
        aria-hidden="true"
      />

      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          type="button"
          variant="outline"
          onClick={onAction}
          className="mt-5"
        >
          {actionLabel}
        </Button>
      )}
    </section>
  )
}

export default ErrorState