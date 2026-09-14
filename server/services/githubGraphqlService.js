import dotenv from "dotenv"
import { normalizeGithubContributionCalendar } from "../../shared/contributionCalendar.js"

dotenv.config()

const query = `
  query($username : String!, $from : DateTime!, $to : DateTime!) {
    user(login: $username) {
      contributionsCollection(from : $from, to : $to){
        contributionCalendar {
          months {
            firstDay
            name
            totalWeeks
            year
          }
          weeks {
          firstDay
          contributionDays {
            date
            contributionCount
            contributionLevel
            weekday
          }
        }
        }
      }
    }
  }
`

const createError = (message, status) => {
  const error = new Error(message)
  error.status = status
  return error
}

export const getContributionRange = (now = new Date()) => {
  const to = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23,
    59,
    59,
    999
  ))
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - 364)

  return { from: from.toISOString(), to: to.toISOString() }
}

async function getContributions(username) {
  const range = getContributionRange()
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify({
      query,
      variables: {
        username,
        ...range
      }
    })
  })


  if (!res.ok) {
    throw createError(`GitHub request failed with status ${res.status}`, res.status)
  }

  const data = await res.json()

  if (data.errors?.length) {
    const githubError = data.errors[0]

    if (githubError.type === "NOT_FOUND") {
      throw createError("GitHub user not found", 404)
    }

    throw createError(githubError.message, 500)
  }

  if (!data.data?.user) {
    throw createError("GitHub user not found", 404)
  }

  const contributionCalendar = normalizeGithubContributionCalendar(
    data.data.user.contributionsCollection.contributionCalendar
  )

  return contributionCalendar
}

export default getContributions
