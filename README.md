# GitHub Dashboard

A developer-activity dashboard that turns public GitHub data into a readable, analytical, and shareable profile experience.

Search a GitHub username to explore profile information, repository statistics, contribution activity, language mix, activity patterns, and shareable snapshots. Compare two or three developers side by side and surface factual differences in their public activity.

> Activity insights are based on public GitHub activity only.

## What it does

### Profile analysis

Search any GitHub username and view:

- Profile information and public statistics
- Contribution activity across the last year
- Current and longest contribution streaks
- Repository statistics
- Repository language distribution
- Searchable and sortable repositories

### Activity intelligence

The dashboard goes beyond displaying contribution data by deriving patterns from contribution history:

- Most active weekday
- Most active month
- Weekday vs weekend activity
- Longest contribution gap
- Activity archetype such as `Sprint Coder`, `Weekend Warrior`, `Steady Committer`, or `Consistent Contributor`

All interpreted activity is explicitly presented as being based on public activity only.

### Compare profiles

Compare two or three GitHub profiles side by side.

The comparison includes:

- Followers
- Following
- Public repositories
- Repository stars and forks
- Most-used language
- Contribution totals
- Current streaks
- Longest streaks
- Compact contribution graphs
- Factual comparison insights

The comparison intentionally avoids subjective claims such as declaring one developer "better".

### Shareable snapshots

Turn analysis into something worth keeping.

Single-profile snapshots can be:

- Copied as formatted text
- Saved as a PNG image

Comparison snapshots can also be:

- Copied as formatted text
- Saved as a PNG image

## Tech stack

### Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui
- Lucide React

### Backend

- Node.js
- Express
- GitHub API
- MongoDB

### Engineering

- Shared JavaScript data-processing modules
- Automated Node.js tests
- Production Vite build
- Responsive layouts
- Keyboard-accessible interactions
- Light and dark themes

## Project structure

```text
github-dashboard/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── ...
├── shared/
│   ├── contributionCalendar.js
│   ├── contributionStats.js
│   ├── activityArchetype.js
│   ├── activityInsights.js
│   └── shareableSnapshot.js
├── test/
├── package.json
└── README.md

