# Poker Range Trainer

🎮 **[Try it live → https://phillyc.github.io/poker_trainer/](https://phillyc.github.io/poker_trainer/)**

A simple Texas Hold'em range selection tool for practicing and visualizing poker starting hand ranges.

## Quick Start

**No installation required!** Just open `index.html` in your web browser.

### How to Use:
1. Navigate to the `poker_trainer` folder
2. Double-click `index.html` (or right-click → Open with → Your browser)
3. Click on any hand to select/deselect it
4. Watch the counter update showing how many hands are in your range

## Understanding the Grid

The 13×13 grid represents all 169 possible starting hands in Texas Hold'em.

### Action Colors
- **Gray**: Fold (unselected)
- **Red**: Raise
- **Green**: Call
- **Red/Green Split**: Mix (Raise or Call)

Click any hand to cycle through: Fold → Raise → Call → Mix → Fold

## Features

- ✅ Visual 13×13 range grid
- ✅ Four-state action system (Fold/Raise/Call/Mix)
- ✅ Click and drag to paint multiple hands
- ✅ Save and load custom ranges
- ✅ Built-in preset ranges (editable via JSON)
- ✅ Selection statistics with breakdown
- ✅ Responsive design
- ✅ LocalStorage persistence

## Customizing Presets

Built-in preset ranges can be easily customized without touching TypeScript!

1. Edit `presets.json` to add/modify ranges
2. Refresh the browser - changes appear immediately
3. See `PRESETS_README.md` for detailed instructions

Example preset structure:
```json
{
  "my-custom-range": {
    "name": "My Custom Range",
    "description": "Description here",
    "hands": ["AA", "KK", "AKs", "AKo"]
  }
}
```

## Files

- `index.html` - Main HTML file
- `styles.css` - Styling
- `app.js` - JavaScript logic (bundled from TypeScript modules)
- `src/` - TypeScript source modules (see [Module Structure](#module-structure))
- `presets.json` - **Editable preset ranges** (no compilation needed!)
- `docker-compose.yml` - Docker development environment
- `Dockerfile.dev` - Development container configuration
- `package.json` - Node.js dependencies and scripts
- `PRESETS_README.md` - Guide for editing presets

## Module Structure

The TypeScript source is organized into logical modules under `src/`:

```
src/
├── app.ts          # Entry point — imports everything, sets up event listeners, init()
├── types.ts        # Shared types and interfaces (HandAction, HandCell, SavedRange, etc.)
├── constants.ts    # Constants (RANKS, STORAGE_KEY, INITIAL_HANDS_COUNT)
├── state.ts        # Centralized mutable state + setter functions
├── grid.ts         # Range grid rendering and drag/touch interaction
├── actions.ts      # Hand action logic (setHandAction, resetAll, selectAll, updateStats)
├── presets.ts      # Preset loading, rendering, and format handling
├── storage.ts      # LocalStorage operations (save/load/delete ranges, clipboard)
├── training.ts     # Training modes (Range Recall + Spot Drill)
└── ui.ts           # Toast notifications, confirm dialogs, mobile navigation
```

All modules use ES imports/exports and are bundled into a single `app.js` IIFE via esbuild.

## Development

### Building

```bash
# Install dependencies
npm install

# Build app.js from source modules
npm run build

# Watch mode — rebuilds on file changes
npm run watch
```

### Option 1: Docker Development Environment 🐳

**Features:**
- ✅ Auto-compiling TypeScript on file save
- ✅ Live browser reload when files change
- ✅ Isolated environment (no local Node.js needed)
- ✅ Consistent across all machines

**Prerequisites:**
- Docker installed in WSL2 (see `DOCKER_SETUP.md` for setup instructions)

**Quick Start:**

**On Windows:**
```bash
dev-start.bat
```

**On Linux/WSL:**
```bash
bash dev-start.sh
```

**Manual Start:**
```bash
# From WSL
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up --build"

# Or if already in WSL
docker compose up --build
```

Then open http://localhost:8080 in your browser.

**Development Commands:**
```bash
# Start development environment
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Rebuild and restart
docker compose up --build
```

### Option 2: Local Development (No Docker)

```bash
npm install
npm run watch
# Open index.html in your browser
```

### Option 3: No Build (Static Files Only)

Simply open `index.html` in your browser. The existing `app.js` file will work as-is.

## Project Structure

```
poker_trainer/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Bundled JavaScript (DO NOT EDIT - auto-generated)
├── src/                    # TypeScript source modules (EDIT THESE)
│   ├── app.ts              # Entry point
│   ├── types.ts            # Type definitions
│   ├── constants.ts        # Constants
│   ├── state.ts            # Centralized state management
│   ├── grid.ts             # Grid rendering & interactions
│   ├── actions.ts          # Hand action logic
│   ├── presets.ts          # Preset management
│   ├── storage.ts          # LocalStorage operations
│   ├── training.ts         # Training modes
│   └── ui.ts               # UI utilities
├── presets.json            # Editable preset ranges
├── docker-compose.yml      # Docker development setup
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build with watch mode
├── package.json            # Node.js configuration
├── dev-start.sh            # Linux/WSL startup script
├── dev-start.bat           # Windows startup script
├── compile.bat             # Simple compilation script
├── README.md               # This file
└── DOCKER_SETUP.md         # Docker setup guide for AI assistants
```

## PR Preview & Approval Workflow

Pull Requests automatically get a live preview deployed and must pass an approval gate before merging.

### How Previews Work

1. **Open a PR** → The `PR Preview Deploy` workflow triggers on `opened`, `synchronize`, and `reopened` events.
2. **Build & Deploy** → The workflow installs dependencies, builds the app, and pushes the output to the `gh-pages` branch under `preview/pr-{N}/`.
3. **Preview URL** → A bot comment on the PR provides the live link:
   `https://philc.io/poker_trainer/preview/pr-{N}/`
4. **Incremental updates** → Each push to the PR updates the same preview directory. The bot edits its existing comment rather than posting a new one.
5. **Cleanup** → When the PR closes, `PR Preview Cleanup` removes the preview directory from `gh-pages`.

### Approval Gate

Every PR starts with a **pending** commit status context called `Preview Approval / gate`. This status must be set to success before auto-merge will proceed.

- **`/approve`** → Sets the gate status to `success` (green), unblocking the merge.
- **`/disapprove`** → Sets the gate status to `failure` (red), blocking the merge.

**To approve a PR:** Comment `/approve` on the PR (as the PR author or a collaborator with write access). The gate bot will:
- Set the commit status to success
- Post a confirmation comment with the preview link

**To disapprove:** Comment `/disapprove`. The gate sets status to failure and posts a confirmation.

**Authorization:** Only the PR author and repository collaborators with write access or higher can trigger `/approve` or `/disapprove`. Unauthorized attempts are rejected with a comment explaining why.

### Auto-Merge Behavior

PRs are auto-merged based on their trust label:

| Label | Behavior |
|-------|----------|
| `trust:p0` | Approved on sight — no review needed (reserved for trivial/revert PRs). |
| `trust:p1` | **Default.** A human reviews and merges. *(No auto-merge.)* |
| `trust:p2` | Auto-merged when all CI checks pass AND the approval gate is green. |
| `trust:p3` | Same as p2 — auto-merged when all gates pass. |

Auto-merge re-evaluates whenever:
- A commit status changes (via the `status` webhook event)
- A check suite completes
- The PR is opened, synchronized, or labeled

For the approval gate to **block merge via the GitHub UI** (not just auto-merge), branch protection must be configured to require the `Preview Approval / gate` status check on the `main` branch.

### Preview Cleanup

When a PR is closed (merged or not), the `PR Preview Cleanup` workflow:
- Deletes the `preview/pr-{N}/` directory from `gh-pages`
- Updates the bot's preview comment to say the preview was removed

### Workflow Files

- `.github/workflows/pr-preview.yml` — Builds and deploys PR previews + sets pending approval gate
- `.github/workflows/preview-approval-gate.yml` — Handles `/approve` and `/disapprove` comments
- `.github/workflows/pr-preview-cleanup.yml` — Removes previews when PRs close
- `.github/workflows/auto-merge.yml` — Auto-merges p2/p3 PRs when gates pass
- `.github/workflows/auto-approve.yml` — Legacy auto-merge (triggered by `automerge` label)
- `.github/workflows/deploy.yml` — Production deploy to GitHub Pages on push to main
- `.github/workflows/ci.yml` — Build verification on all PRs

## For AI Assistants 🤖

See `DOCKER_SETUP.md` for complete Docker development environment setup and usage instructions.
