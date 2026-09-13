import {
  MapPin,
  Users,
  GitFork,
  ExternalLink,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Separator } from "@/components/ui/separator"

const getInitials = (name, username) => {
  const value = name || username || ""

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

const ProfileCard = ({ profile }) => {
  if (!profile) {
    return null
  }

  const initials = getInitials(
    profile.name,
    profile.login
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <Avatar className="size-20 shrink-0 border border-border sm:size-24">
            <AvatarImage
              src={profile.avatar_url}
              alt={`${profile.login} avatar`}
            />

            <AvatarFallback className="font-mono text-lg sm:text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {profile.name || profile.login}
              </h2>

              <p className="font-mono text-sm text-muted-foreground sm:text-base">
                @{profile.login}
              </p>
            </div>

            <p className="w-full max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {profile.bio || "No bio available"}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:gap-x-5">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="min-w-0 break-words">
                    {profile.location}
                  </span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <Users
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                <span className="font-mono tabular-nums">
                  {profile.followers}
                </span>

                followers
              </span>

              <span className="inline-flex items-center gap-1.5">
                <GitFork
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

                <span className="font-mono tabular-nums">
                  {profile.public_repos}
                </span>

                repos
              </span>
            </div>
          </div>
        </div>

        <a
          href={profile.html_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View GitHub profile

          <ExternalLink
            className="size-4"
            aria-hidden="true"
          />
        </a>
      </div>

      <Separator />
    </section>
  )
}

export default ProfileCard