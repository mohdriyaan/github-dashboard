import { useMemo, useState } from "react"

import { ExternalLink, GitFork, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import getLanguageColor from "../utils/languageColors.js"

const SORT_OPTIONS = [
  { value: "updated", label: "Recently updated" },
  { value: "stars", label: "Most stars" },
  { value: "forks", label: "Most forks" },
  { value: "name", label: "Name (A–Z)" },
]
const EMPTY_REPOSITORIES = []

const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
})

const formatUpdatedDate = (date) => {
  if (!date) return "Unknown"

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown"
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate)
}

const getRepositoryText = (value) => (
  typeof value === "string" ? value.trim() : ""
)

const getRepositoryName = (repo) => getRepositoryText(repo?.name)

const getRepositoryLanguage = (repo) => getRepositoryText(repo?.language)

const getRepositoryNumber = (value) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}

const getUpdatedTimestamp = (date) => {
  const timestamp = Date.parse(date)

  return Number.isNaN(timestamp) ? 0 : timestamp
}

const compareRepositoryNames = (first, second) => {
  const firstName = getRepositoryName(first)
  const secondName = getRepositoryName(second)

  if (!firstName) return secondName ? 1 : 0
  if (!secondName) return -1

  return collator.compare(firstName, secondName)
}

const compareRepositories = (first, second, sortBy) => {
  let difference = 0

  if (sortBy === "updated") {
    difference = getUpdatedTimestamp(second.updated_at) - getUpdatedTimestamp(first.updated_at)
  } else if (sortBy === "stars") {
    difference = getRepositoryNumber(second.stargazers_count) - getRepositoryNumber(first.stargazers_count)
  } else if (sortBy === "forks") {
    difference = getRepositoryNumber(second.forks_count) - getRepositoryNumber(first.forks_count)
  }

  return difference || compareRepositoryNames(first, second)
}

const RepositoryList = ({ repos }) => {
  const [sortBy, setSortBy] = useState("updated")
  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const repositoryData = repos ?? EMPTY_REPOSITORIES

  const languages = useMemo(() => (
    [...new Set(
      repositoryData
        .map(getRepositoryLanguage)
        .filter(Boolean)
    )].sort(collator.compare)
  ), [repositoryData])

  const filteredRepos = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()

    return repositoryData.filter((repo) => {
      const name = getRepositoryName(repo).toLocaleLowerCase()
      const description = getRepositoryText(repo?.description).toLocaleLowerCase()
      const matchesSearch = !query || name.includes(query) || description.includes(query)
      const matchesLanguage = languageFilter === "all" || getRepositoryLanguage(repo) === languageFilter

      return matchesSearch && matchesLanguage
    })
  }, [languageFilter, repositoryData, searchQuery])

  const visibleRepos = useMemo(() => (
    filteredRepos
      .map((repo, index) => ({ repo, index }))
      .sort((first, second) => (
        compareRepositories(first.repo, second.repo, sortBy) || first.index - second.index
      ))
      .map(({ repo }) => repo)
  ), [filteredRepos, sortBy])

  const hasActiveFilters = Boolean(searchQuery.trim()) || languageFilter !== "all" || sortBy !== "updated"

  const resetFilters = () => {
    setSearchQuery("")
    setLanguageFilter("all")
    setSortBy("updated")
  }

  if (!repositoryData.length) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">
            Repositories
          </h2>

          <p className="text-base text-muted-foreground">
            Public repositories
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap lg:w-auto lg:flex-nowrap">
          <div className="min-w-0 flex-1 lg:w-56 lg:flex-none">
            <label className="sr-only" htmlFor="repository-search">
              Search repositories
            </label>
            <Input
              id="repository-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search repositories"
              className="w-full"
            />
          </div>

          <label className="min-w-0 sm:w-44">
            <span className="sr-only">Filter repositories by language</span>
            <select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="all">All languages</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 sm:w-44">
            <span className="sr-only">Sort repositories</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {visibleRepos.length ? (
        <div className="divide-y divide-border border-y border-border">
          {visibleRepos.map((repo, index) => {
            const language = getRepositoryLanguage(repo)
            const languageColor = getLanguageColor(language)

            return (
              <article
                key={repo.id || repo.html_url || `${getRepositoryName(repo)}-${index}`}
                className="py-6 sm:py-7"
              >
              <div className="flex items-start justify-between gap-8">
                <div className="min-w-0 flex-1 space-y-4">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex max-w-full items-center gap-2 rounded-sm px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <h3 className="text-xl font-semibold tracking-tight">
                      {repo.name}
                    </h3>

                    <ExternalLink
                      className="size-4 text-muted-foreground transition-opacity group-hover:opacity-70"
                      aria-hidden="true"
                    />
                  </a>

                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {repo.description || "No description"}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                    {language && (
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              languageColor || "transparent",
                          }}
                        />

                        <span>{language}</span>
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
                    <span>
                      Updated {formatUpdatedDate(repo.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="border-y border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No repositories match your filters.
          </p>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4"
            >
              Reset filters
            </Button>
          )}
        </div>
      )}
    </section>
  )
}

export default RepositoryList
