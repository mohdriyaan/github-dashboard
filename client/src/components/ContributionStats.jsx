const ContributionStats = ({ stats }) => {
  return (
    <div>
      <h2>Contribution Statistics</h2>
      <p>Total Contributions: {stats?.totalContributions}</p>
      <p>Current Streak: {stats?.currentStreak}</p>
      <p>Longest Streak: {stats?.longestStreak}</p>
    </div>
  )
}
export default ContributionStats