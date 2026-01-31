# Umbrella | Poppins

Practically perfect time splitting in every way.

Umbrella is an internal tool for splitting and redistributing Harvest time entries across billable projects, with Jira integration for ticket tracking.

## What It Does

1. **Fetch Time Entries** — Pull Harvest time entries for this week or last week
2. **Select a User** — Choose whose entries to work with
3. **Pick Entries to Split** — Select 1x1 or bill-to-client entries
4. **Split Time** — Distribute minutes across projects using a greedy fill algorithm based on billable hour percentages, rounded to the nearest 5 minutes
5. **Preview & Submit** — Review the new entries and submit them back to Harvest

### Entry Types

- **1x1** — Entries are split between two users with fuzzy name matching from notes
- **Bill to Client** — Entries are distributed across billable projects proportionally, filling largest projects first

## Tech Stack

- React 18
- Redux + redux-thunk (state management)
- React Router (multi-step navigation)
- React Bootstrap (UI components)
- Tailwind CSS + custom Mary Poppins theme

## Getting Started

### Prerequisites

- Node.js
- Backend API running ([harvest-tracker-api](https://harvest-tracker-api.onrender.com))

### Install & Run

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Serve production build |
| `npm test` | Run tests in watch mode |
| `npm run format` | Format code with Prettier |

## Project Structure

```
src/
  components/    # Reusable UI components (Header, Footer, Loader, etc.)
  pages/         # Step-by-step workflow pages (TimeEntriesPage 1-6)
  store/
    actions/     # Redux action creators (timeEntries, users, projects, tasks, jira)
    reducers/    # Redux reducers
  utils/         # Helper functions, role mapping, test data
public/
  logo.svg       # Umbrella logo
  hero.svg       # Home page hero image
  favicon.svg    # Browser favicon
```
