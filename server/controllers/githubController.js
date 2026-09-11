import getContributions from "../services/githubGraphqlService.js"

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

    return res.status(200).json({
      contributionCalendar
    })
  } catch (error) {
    return res.status(500).json({
      error : error.message
    })
  }

}

export { contributionsController }

