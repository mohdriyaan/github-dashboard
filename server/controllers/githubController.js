import getContributions from "../services/githubGraphqlService.js"
import getContributionStats from "../utils/contributionUtils.js"

const contributionsController = async (req, res) => {
  try {
    let { username } = req.body

    username = username?.trim()

    if (!username) {
      return res.status(400).json({
        error: "Username is required"
      })
    }

    const contributionCalendar = await getContributions(username)

    const stats = getContributionStats(contributionCalendar)

    return res.status(200).json({
      contributionCalendar,
      stats
    })
  } catch (error) {
    return res.status(500).json({
      error : error.message
    })
  }

}

export { contributionsController }

