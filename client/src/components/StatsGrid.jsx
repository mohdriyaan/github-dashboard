const StatsGrid = ({ stats }) => {
  return (
    <div>
      <h2>Repository Statistics</h2>
      <p>Total Stars: {stats?.totalStars}</p>
      <p>Total Forks: {stats?.totalForks}</p>
      <p>Most Used Language: {stats?.mostUsedLanguage}</p>
    </div>
  )
}
export default StatsGrid