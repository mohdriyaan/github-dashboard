const RepositoryList = ({ repos }) => {
  return (
    <div>
      <h2>Repositories</h2>
      {repos.map((repo) => {
        return (
          <div key={repo.id}>
            <p>Name: {repo?.name}</p>
            <p>Description: {repo?.description || "No description"}</p>
            <p>Total Stars: {repo?.stargazers_count}</p>
            <p>Total Forks: {repo?.forks_count}</p>
            <p>Most used language: {repo?.language || "Not specified"}</p>
            <br />
          </div>
        )
      })}
    </div>
  )
}
export default RepositoryList