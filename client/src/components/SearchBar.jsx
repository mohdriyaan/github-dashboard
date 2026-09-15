import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function SearchBar({ onSearch, isLoading }) {
  const [username, setUsername] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef(null)

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      if (event.key !== "/") {
        return
      }

      const target = event.target

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener(
      "keydown",
      handleGlobalKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleGlobalKeyDown
      )
    }
  }, [])

  function handleChange(event) {
    setUsername(event.target.value)
  }

  function handleSearch() {
    const trimmedUsername = username.trim()

    onSearch(trimmedUsername)
    setUsername("")
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter") {
      return
    }

    event.preventDefault()
    handleSearch()
  }

  const canSearch =
    username.trim().length > 0 && !isLoading

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        if (!isLoading) {
          handleSearch()
        }
      }}
      className="flex w-full max-w-md min-w-0 gap-2"
      role="search"
      aria-label="Search GitHub profile"
    >
      <div className="relative min-w-0 flex-1">
        <label
          htmlFor="github-username-search"
          className="sr-only"
        >
          GitHub username
        </label>

        <Input
          ref={inputRef}
          id="github-username-search"
          name="username"
          type="text"
          value={username}
          placeholder="Enter GitHub username"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          aria-describedby="github-search-hint"
          className="min-w-0 pr-10"
        />

        {!isFocused && !username && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] leading-none text-muted-foreground"
          >
            /
          </span>
        )}

        <span
          id="github-search-hint"
          className="sr-only"
        >
          Press slash to focus this search field.
        </span>
      </div>

      <Button
        type="submit"
        disabled={!canSearch}
        aria-busy={isLoading}
        className="shrink-0"
      >
        {isLoading ? (
          <>
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />
            <span>Search</span>
          </>
        ) : (
          "Search"
        )}
      </Button>
    </form>
  )
}

export default SearchBar