import { MapPin, Users, GitFork, ExternalLink } from "lucide-react"

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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-5">
          <Avatar className="size-24 shrink-0 border border-border">
            <AvatarImage
              src={profile.avatar_url}
              alt={`${profile.login} avatar`}
            />

            <AvatarFallback className="font-mono text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-3">
            <div>
              <h2 className="truncate text-3xl font-semibold tracking-tight">
                {profile.name || profile.login}
              </h2>

              <p className="font-mono text-base text-muted-foreground">
                @{profile.login}
              </p>
            </div>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {profile.bio || "No bio available"}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {profile.location}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" />
                <span className="font-mono tabular-nums">
                  {profile.followers}
                </span>
                followers
              </span>

              <span className="inline-flex items-center gap-1.5">
                <GitFork className="size-4" />
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
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          View GitHub profile
          <ExternalLink className="size-4" />
        </a>
      </div>

      <Separator />
    </section>
  )
}

export default ProfileCard