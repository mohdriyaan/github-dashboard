const repoStats = (repos) => {
  const sourceRepos = repos.filter(
    (repo) => repo.fork === false
  )

  const totalStars = sourceRepos.reduce(
    (acc, repo) => acc + (repo.stargazers_count || 0),
    0
  )

  const totalForks = sourceRepos.reduce(
    (acc, repo) => acc + (repo.forks_count || 0),
    0
  )

  const languageCounts = sourceRepos.reduce(
    (acc, repo) => {
      const language = repo.language

      if (!language) {
        return acc
      }

      acc[language] = (acc[language] || 0) + 1

      return acc
    },
    {}
  )

  let mostUsedLanguage = null
  let maxCount = 0

  for (const [language, count] of Object.entries(languageCounts)) {
    if (count > maxCount) {
      maxCount = count
      mostUsedLanguage = language
    }
  }

  return {
    totalStars,
    totalForks,
    mostUsedLanguage,
    languageCounts,
  }
}

export default repoStats