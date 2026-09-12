const flattenContributionDays = (result) => {
  const weeks = result.weeks

  const flattenedDays = weeks.flatMap((week)=>{
    return week.contributionDays.map((day)=> ({
      date : day.date,
      count : day.contributionCount  
    }))
  })

  return flattenedDays
}

const totalContributionsCount = (contributionDays) => {
  return contributionDays.reduce((total, day) => total + day.count, 0)
}

const longestStreak = (contributionDays) => {
  let currentStreak = 0
  let longestStreak = 0

  for(const day of contributionDays){
    if(day.count > 0){
      currentStreak += 1
    } else {
      currentStreak = 0
    }

    if(currentStreak > longestStreak){
      longestStreak = currentStreak
    }
  }

  return longestStreak
}

const currentStreak = (contributionDays) => {
  if (contributionDays.length === 0) return 0

  let streak = 0
  let startIndex = contributionDays.length - 1

  // If today has zero contributions, skip it and start from yesterday
  if (contributionDays[startIndex].count === 0) {
    startIndex -= 1
  }

  for (let i = startIndex; i >= 0; i--) {
    if (contributionDays[i].count > 0) {
      streak += 1
    } else {
      break
    }
  }

  return streak
}

const getContributionStats = (result) => {
  const contributionDays = flattenContributionDays(result)

  return {
    totalContributions: totalContributionsCount(contributionDays),
    currentStreak: currentStreak(contributionDays),
    longestStreak: longestStreak(contributionDays)
  }
}

export default getContributionStats 


