import dotenv from "dotenv"

dotenv.config()

const query = `
  query($username : String!, $from : DateTime!, $to : DateTime!) {
    user(login: $username) {
      contributionsCollection(from : $from, to : $to){
        contributionCalendar {
          weeks {
          contributionDays {
            date
            contributionCount
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

async function getContributions(username) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  const previousYear = currentYear - 1

  const previousDate = new Date(currentDate)
  previousDate.setFullYear(previousYear)
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
        from: previousDate.toISOString(),
        to: currentDate.toISOString()
      }
    })
  })

  if (!res.ok) {
    throw createError(`GitHub request failed with status ${res.status}`, res.status)
  }

  const data = await res.json()

  if(data.errors){
    throw createError(data.errors[0].message, 500)
  }

  if(!data.data?.user){
    throw createError("Github user not found", 404)
  }

  const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar

  return contributionCalendar
}

export default getContributions