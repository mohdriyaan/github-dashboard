import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function SearchBar({ onSearch, isLoading }) {
  const [username, setUsername] = useState("")

  function onChange(event) {
    setUsername(event.target.value)
  }

  function handleSearch() {
    onSearch(username)
    setUsername("")
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="flex w-full max-w-md min-w-0 gap-2">
      <Input
        type="text"
        value={username}
        placeholder="Enter GitHub username"
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="min-w-0 flex-1"
      />

      <Button
        type="button"
        onClick={handleSearch}
        disabled={isLoading}
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
    </div>
  )
}

export default SearchBar