import { ExternalLink, GitFork, Star } from "lucide-react"

import getLanguageColor from "../utils/languageColors.js"

const RepositoryList = ({ repos }) => {
  if (!repos?.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">
          Repositories
        </h2>

        <p className="text-base text-muted-foreground">
          Public repositories
        </p>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {repos.map((repo) => {
          const languageColor = getLanguageColor(repo.language)

          return (
            <article
              key={repo.id}
              className="py-7"
            >
              <div className="flex items-start justify-between gap-8">
                <div className="min-w-0 flex-1 space-y-4">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2"
                  >
                    <h3 className="text-xl font-semibold tracking-tight">
                      {repo.name}
                    </h3>

                    <ExternalLink
                      className="size-4 text-muted-foreground transition-opacity group-hover:opacity-70"
                      aria-hidden="true"
                    />
                  </a>

                  <p className="max-w-4xl text-base leading-7 text-muted-foreground">
                    {repo.description || "No description"}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                    {repo.language && (
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              languageColor || "transparent",
                          }}
                        />

                        <span>{repo.language}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2">
                      <Star
                        className="size-4"
                        aria-hidden="true"
                      />

                      <span className="font-mono tabular-nums">
                        {repo.stargazers_count ?? 0}
                      </span>

                      <span>stars</span>
                    </span>

                    <span className="inline-flex items-center gap-2">
                      <GitFork
                        className="size-4"
                        aria-hidden="true"
                      />

                      <span className="font-mono tabular-nums">
                        {repo.forks_count ?? 0}
                      </span>

                      <span>forks</span>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default RepositoryList