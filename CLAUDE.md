# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Serve production build (requires build first)
- `npm test` - Run tests in watch mode
- `npm test -- --testPathPattern="<pattern>"` - Run specific test file
- `npm run format` - Format code with Prettier (uses `@inventivegroup/prettier-config`)

## Architecture

"Umbrella | Poppins" - a React 18 internal tool for splitting and managing Harvest time entries across projects, with Jira integration for ticket tracking.

### State Management (Redux + redux-thunk)

Store slices in `src/store/reducers/`:
- `timeEntries` - Harvest time entries, billable hours, selected week, split entries
- `users` - Harvest users
- `projects` - Harvest projects
- `tasks` - Harvest tasks
- `jira` - Jira tickets, users, projects, issues

Async action pattern: `FETCH_*_REQUEST` → `FETCH_*_SUCCESS` / `FETCH_*_FAILURE`

Logger middleware (`src/store/loggerMiddleware.js`) logs state after every action for debugging.

### API Integration

Backend API: `https://harvest-tracker-api.onrender.com` (production) or `localhost:3002` (development)

Environment check uses `process.env.ENV === 'dev'` - note the .env file uses `ENVIRONMENT` key.

Key endpoints:
- `GET /api/get-harvest-time-entries-by-date?from=&to=`
- `GET /api/harvest-users`, `/api/harvest-projects`, `/api/harvest-tasks`
- `POST /api/create-harvest-time-entries`
- `GET /api/jira-users`, `/api/jira-projects`, `/api/jira-search`, `/api/jira-person-issues`

### Business Logic (`src/utils/functions.js`)

- `numHoursToCrossOff = 1` - Projects with ≤1 hour are excluded from billable percentage calculations
- Internal client IDs filtered out: `11188314` (Inventive Group), `7044177` (Inventive Projects)
- `calculateBillableHours()` - Aggregates billable hours by project code
- `organizeEntriesByUser()` - Groups time entries by user with project breakdown

### Role Mapping (`src/utils/roleMapping.js`)

Maps Harvest user IDs to employee names and primary roles (QA, SA, SSE, WebDev, DevOps, Product Manager, Design, etc.).

### Multi-Step Time Entry Workflow

`/time-entries` (Step 1: fetch by date range) → `/time-entries-step-2` (select user & entries) → `/time-entries-step-3` (review selected entries) → Step 4 or Step 6 → `/time-entries-step-5` (preview & submit)

Two paths from Step 3 based on entry type:
- **1x1 entries** → `/time-entries-step-4` — Split between two users with fuzzy name matching
- **Bill-to-client entries** → `/time-entries-step-6` ("Time Entries - Allocate Minutes") — User can exclude projects via checkboxes before confirming allocations. Greedy fill algorithm distributes time across remaining billable projects by percentage (largest projects fill first, rounded to nearest 5 minutes). Confirmed allocations are stored in state to prevent premature/stale computation.

Step 5 ("Time Entry Submission") submits entries individually with per-entry success/failure indicators. Failures don't stop remaining submissions.

Each step page passes state via Redux; navigation uses react-router-dom's `useNavigate`.

### Common Pitfalls

- Entry IDs from form inputs are strings; Redux store IDs are numbers. Always use `String()` coercion when comparing: `String(p.id) === String(entry.project_id)`
- `setHarvestEntries` appends to existing array in Redux — entries are tagged with `groupId` for visual grouping in the preview table
- `package-lock.json` is gitignored; `npm update` only changes `node_modules`, not `package.json`
- `gh` CLI is not authenticated; PRs are created via GitHub web UI
