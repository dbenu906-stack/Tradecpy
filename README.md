# Tradecpy

Tradecpy is a Next.js + Firebase web application for real-time MT5 trading signal orchestration and GitHub-backed signal publishing.

## How the website works

### 1. Frontend interface

The website is built with **Next.js 15**, **React 19**, and **Tailwind CSS**. The main UI is in `src/app/dashboard/page.tsx` and includes:

- A live dashboard with trade metrics and bridge status
- A trade terminal for sending BUY or SELL signals
- A registry table that displays signals stored in `trades.json`
- Firestore-backed account data for master and follower terminals

### 2. Firebase client provider

The app uses `FirebaseClientProvider` from `src/firebase` to initialize Firebase on the client side and provide Firestore access.

### 3. Trade signal generation

When a user submits a trade from the dashboard, the app calls `openMasterTrade()` in `src/lib/trade-service.ts`.

That function:

- logs a simulated MT5 handshake and execution flow
- reads follower accounts from Firestore (`accounts` collection)
- creates a master signal plus follower signals using each follower's multiplier
- posts the generated signals to the backend API at `/api/git-trade`

### 4. Git-backed signal storage

The backend API route is defined in `src/app/api/git-trade/route.ts`.

It supports:

- `GET /api/git-trade` to read the current `trades.json` file from GitHub
- `POST /api/git-trade` to publish new signal records back to the `trades.json` file in the repository

The route uses the GitHub REST API and requires a GitHub token via environment variable.

### 5. Live trade registry

The dashboard fetches the `trades.json` contents from `/api/git-trade` to show the live signal registry.
This makes the site act as both a signal generator and a Git-backed trade ledger.

## Key files

- `src/app/layout.tsx` — root layout, providers, and global page structure
- `src/app/dashboard/page.tsx` — main dashboard UI and trade terminal
- `src/lib/trade-service.ts` — trade signal creation and backend publish logic
- `src/app/api/git-trade/route.ts` — API route for reading and writing `trades.json`
- `src/firebase/*` — Firebase initialization and hooks for Firestore
- `trades.json` — GitHub-backed signal storage file

## Running the app locally

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

- `GITHUB_TOKEN` — personal access token with repo write permission
- optionally `NEXT_PUBLIC_GIT_PROJECT_ID` to override the GitHub repository identifier

3. Start the app:

```bash
npm run dev
```

Then open `http://localhost:9002`.

## What this site is for

Tradecpy is designed to simulate and publish MT5 trading signals from a master account to follower accounts. It demonstrates how to combine:

- frontend trade operation UI
- Firestore account registry
- backend GitHub file updates
- live signal registry display

## Notes

- The MT5 bridge behavior in `src/lib/trade-service.ts` is currently simulated with console logs and delays.
- Real execution requires integration with a live MT5 or broker API.
- The GitHub-backed `trades.json` file is used as the persistent signal ledger.
