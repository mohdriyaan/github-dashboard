import { useEffect, useState } from "react"

import { Moon, Sun } from "lucide-react"

import SearchBar from "./SearchBar.jsx"

const actionButtonClass =
  "inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const iconButtonClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const DashboardHeader = ({
  onSearch,
  isLoading,
  onCompare,
  isCompareView,
}) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light"
    }

    return localStorage.getItem("theme") || "light"
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    )
  }

  const compareLabel = isCompareView
    ? "Profile search"
    : "Compare"

  const themeLabel =
    theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode"

  const themeIcon =
    theme === "dark" ? (
      <Sun
        className="size-4"
        aria-hidden="true"
      />
    ) : (
      <Moon
        className="size-4"
        aria-hidden="true"
      />
    )

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">

        {/* Mobile / Tablet */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 lg:hidden">
          <h1 className="min-w-0 self-center truncate text-lg font-semibold tracking-tight">
            GitHub Profile Finder
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCompare}
              aria-pressed={isCompareView}
              className={actionButtonClass}
            >
              {compareLabel}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              className={iconButtonClass}
            >
              {themeIcon}
            </button>
          </div>

          {!isCompareView && (
            <div className="col-span-2 min-w-0 pt-1">
              <SearchBar
                onSearch={onSearch}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden min-h-16 grid-cols-[auto_minmax(240px,640px)_auto_auto] items-center justify-between gap-5 lg:grid">
          <h1 className="shrink-0 text-xl font-semibold tracking-tight">
            GitHub Profile Finder
          </h1>

          {isCompareView ? (
            <div aria-hidden="true" />
          ) : (
            <div className="min-w-0 justify-self-center w-full">
              <SearchBar
                onSearch={onSearch}
                isLoading={isLoading}
              />
            </div>
          )}

          <button
            type="button"
            onClick={onCompare}
            aria-pressed={isCompareView}
            className={actionButtonClass}
          >
            {compareLabel}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            className={iconButtonClass}
          >
            {themeIcon}
          </button>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader