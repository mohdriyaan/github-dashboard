import GitHubColors from "github-colors"

const getLanguageColor = (language) => {
  if (!language) {
    return null
  }

  const languageData = GitHubColors.get(language)

  return languageData?.color || null
}

export default getLanguageColor