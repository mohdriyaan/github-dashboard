/*
 * Calculates statistics from an array of GitHub repositories.
 * Only processes repositories where fork === false.
*/
const repoStats = (repos) => {
  // 🛠️ Task 2 — Filter forked repositories (keeps original array pure)
  const sourceRepos = repos.filter(repo => repo.fork === false);

  // 🛠️ Task 3 — Calculate total stars
  const totalStars = sourceRepos.reduce((acc, repo) => {
    return acc + (repo.stargazers_count || 0);
  }, 0);

  // 🛠️ Task 4 — Calculate total forks
  const totalForks = sourceRepos.reduce((acc, repo) => {
    return acc + (repo.forks_count || 0);
  }, 0);

  // 🛠️ Task 5 — Calculate most-used language
  const mostUsedLanguage = sourceRepos.reduce((acc, repo) => {
    const lang = repo.language;
    
    // Edge case: Skip null or undefined languages
    if (!lang) return acc;

    // Build the frequency table
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {}); // Starts as an empty object/frequency table

  // Extract the language with the highest count
  let topLanguage = null;
  let maxCount = 0;

  for (const [language, count] of Object.entries(mostUsedLanguage)) {
    if (count > maxCount) {
      maxCount = count;
      topLanguage = language;
    }
  }

  // 🛠️ Task 6 — Return one stats object
  return {
    totalStars,
    totalForks,
    mostUsedLanguage: topLanguage
  };
};

export default repoStats

