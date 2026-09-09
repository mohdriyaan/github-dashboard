import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

function SearchBar({ onSearch, isLoading }) {
  const [username, setUsername] = useState("")

  function onChange(event) {
    setUsername(event.target.value)
  }

  function handleSearch() {
    onSearch(username)
  }

  return (
    <div className="flex w-full max-w-md gap-2 p-5">
      <Input
        type="text"
        value={username}
        placeholder="Enter GitHub username"
        onChange={onChange}
      />
      <Button onClick={handleSearch} disabled={isLoading}>{isLoading ? "Loading..." : "Search"}</Button>
    </div>
  )
}

export default SearchBar