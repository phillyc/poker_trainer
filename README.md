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

## For AI Assistants 🤖

See `DOCKER_SETUP.md` for complete Docker development environment setup and usage instructions.
