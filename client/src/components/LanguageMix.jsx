import { useMemo } from "react"

import getLanguageColor from "../utils/languageColors.js"

const LanguageMix = ({ languageCounts }) => {
  const languages = useMemo(() => {
    const entries = Object.entries(languageCounts || {})
      .filter(([, count]) => Number(count) > 0)
      .map(([language, count]) => ({
        language,
        count: Number(count),
        color: getLanguageColor(language),
      }))
      .sort((first, second) => {
        return (
          second.count - first.count ||
          first.language.localeCompare(second.language)
        )
      })

    const total = entries.reduce(
      (sum, entry) => sum + entry.count,
      0
    )

    return entries.map((entry) => ({
      ...entry,
      percentage: total
        ? (entry.count / total) * 100
        : 0,
    }))
  }, [languageCounts])

  if (!languages.length) {
    return null
  }

  return (
    <section
      aria-labelledby="language-mix-heading"
      className="space-y-3"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="language-mix-heading"
          className="text-sm font-semibold"
        >
          Language mix
        </h2>

        <span className="font-mono text-xs text-muted-foreground">
          {languages.reduce(
            (total, entry) => total + entry.count,
            0
          )} repos
        </span>
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-sm bg-muted"
        role="img"
        aria-label={`Language mix across ${languages.reduce(
          (total, entry) => total + entry.count,
          0
        )} repositories`}
      >
        {languages.map((entry) => (
          <span
            key={entry.language}
            title={`${entry.language}: ${entry.percentage.toFixed(0)}%`}
            aria-hidden="true"
            className="h-full min-w-1"
            style={{
              width: `${entry.percentage}%`,
              backgroundColor: entry.color || "var(--muted-foreground)",
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {languages.map((entry) => (
          <span
            key={entry.language}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  entry.color || "var(--muted-foreground)",
              }}
            />

            <span>{entry.language}</span>

            <span className="font-mono tabular-nums">
              {entry.percentage.toFixed(0)}%
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}

export default LanguageMix