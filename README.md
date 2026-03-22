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
- `app.js` - JavaScript logic (compiled from TypeScript)
- `app.ts` - TypeScript source code
- `presets.json` - **Editable preset ranges** (no compilation needed!)
- `docker-compose.yml` - Docker development environment
- `Dockerfile.dev` - Development container configuration
- `package.json` - Node.js dependencies and scripts
- `PRESETS_README.md` - Guide for editing presets

## Development

### Option 1: Docker Development Environment (Recommended) 🐳

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

### Option 2: Simple Compilation (No Live Reload)

For quick TypeScript compilation without the full dev environment:

**Windows:**
```bash
compile.bat
```

**Linux/WSL:**
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker build -t poker-trainer-builder . && docker create --name poker-temp poker-trainer-builder && docker cp poker-temp:/app/app.js . && docker rm poker-temp"
```

### Option 3: No Docker (Static Files Only)

Simply open `index.html` in your browser. The existing `app.js` file will work as-is.

## Project Structure

```
poker_trainer/
├── index.html              # Main HTML file
├── styles.css              # Styling
├── app.js                  # Compiled JavaScript (DO NOT EDIT - auto-generated)
├── app.ts                  # TypeScript source (EDIT THIS)
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
