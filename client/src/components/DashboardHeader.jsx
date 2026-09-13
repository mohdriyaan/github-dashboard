import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import SearchBar from "./SearchBar.jsx"

const DashboardHeader = ({ onSearch, isLoading }) => {
  const [theme, setTheme] = useState(() => {
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
      currentTheme === "dark" ? "light" : "dark"
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">

        {/* Mobile / Tablet */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 lg:hidden">
          <h1 className="min-w-0 self-center truncate text-lg font-semibold tracking-tight">
            GitHub Profile Finder
          </h1>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>

          <div className="col-span-2 min-w-0">
            <SearchBar
              onSearch={onSearch}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-8 lg:grid">
          <h1 className="shrink-0 text-xl font-semibold tracking-tight">
            GitHub Profile Finder
          </h1>

          <div className="flex min-w-0 justify-center">
            <SearchBar
              onSearch={onSearch}
              isLoading={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </button>
        </div>

      </div>
    </header>
  )
}

export default DashboardHeader