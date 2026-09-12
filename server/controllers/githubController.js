import getContributions from "../services/githubGraphqlService.js"
import { getUser, getUserRepos } from "../services/githubRestService.js"
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
    return res.status(error.status || 500).json({
      error: error.message
    })
  }
}

const profileController = async (req, res) => {
  try {
    let { username } = req.body

    username = username?.trim()

    if (!username) {
      return res.status(400).json({
        error: "Username is required"
      })
    }

    const user = await getUser(username)

    return res.status(200).json(user)
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    })
  }
}

const reposController = async (req, res) => {
  try {
    let { username } = req.body

    username = username?.trim()

    if (!username) {
      return res.status(400).json({
        error: "Username is required"
      })
    }

    const repos = await getUserRepos(username)

    return res.status(200).json({
      repos
    })
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message
    })
  }
}



export { contributionsController, profileController, reposController }

