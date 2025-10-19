# Docker Development Environment Setup

> **For AI Assistants:** This document provides complete context for working with this project's Docker development environment.

## Environment Overview

This project uses Docker in WSL2 (Windows Subsystem for Linux) for an isolated, reproducible development environment.

### Key Information

- **Host OS**: Windows 10/11
- **Docker Location**: WSL2 (Ubuntu)
- **Project Path (Windows)**: `C:\Users\ph1c\dev\poker_trainer`
- **Project Path (WSL)**: `/mnt/c/Users/ph1c/dev/poker_trainer`
- **Docker Version**: 28.5.1
- **Docker Compose Version**: 2.40.1

## Architecture

### Container Services

The development environment consists of two Docker services:

1. **typescript-compiler** (`poker-trainer-compiler`)
   - Watches `app.ts` for changes
   - Auto-compiles to `app.js` using TypeScript
   - Runs in watch mode continuously

2. **web-server** (`poker-trainer-server`)
   - Serves files on http://localhost:8080
   - Live-reloads browser when files change
   - Uses `live-server` for hot-reload functionality

### Volume Mounts

Both services mount the project directory at `/app` inside containers, ensuring:
- Changes made on host (Windows) are immediately visible in containers
- Compiled files appear immediately in the host filesystem
- No file copying or manual sync needed

## Working with Docker in This Project

### Always Use WSL for Docker Commands

Since Docker is installed in WSL2, all Docker commands must run through WSL:

```bash
# From PowerShell/CMD (Windows)
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up"

# Or enter WSL first, then run commands
wsl
cd /mnt/c/Users/ph1c/dev/poker_trainer
docker compose up
```

### Common Development Commands

**Start Development Environment:**
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up -d"
```

**View Live Logs:**
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs -f"
```

**Stop Environment:**
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose down"
```

**Rebuild and Restart:**
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up --build"
```

**Check Running Containers:**
```bash
wsl bash -c "docker ps"
```

### Quick Compilation (Without Full Dev Environment)

For one-off TypeScript compilation:

```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker build -t poker-trainer-builder . && docker create --name poker-temp poker-trainer-builder && docker cp poker-temp:/app/app.js . && docker rm poker-temp"
```

Or use the batch script:
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && ./compile.bat"
```

## File Structure

### Source Files
- `app.ts` - TypeScript source (EDIT THIS)
- `app.js` - Compiled JavaScript (AUTO-GENERATED, DO NOT EDIT)
- `index.html` - Main HTML file
- `styles.css` - Styling

### Docker Configuration
- `docker-compose.yml` - Multi-container development setup
- `Dockerfile` - Production build (simple compilation)
- `Dockerfile.dev` - Development build (watch mode)
- `package.json` - Node.js dependencies and scripts

### Helper Scripts
- `dev-start.sh` - Start dev environment (Linux/WSL)
- `dev-start.bat` - Start dev environment (Windows)
- `compile.bat` - Quick compile without dev server

## Development Workflow

### For Code Changes:

1. **Start the dev environment** (if not already running):
   ```bash
   wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up -d"
   ```

2. **Edit TypeScript source** (`app.ts`):
   - TypeScript compiler automatically detects changes
   - Compiles to `app.js` within seconds
   - Browser auto-reloads with new changes

3. **Access the app**:
   - Open http://localhost:8080 in any browser
   - Changes appear automatically (no manual refresh needed)

4. **Monitor compilation**:
   ```bash
   wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs -f typescript-compiler"
   ```

### For AI Assistants Making Changes:

When making code changes to this project:

1. ✅ **Preferred**: Edit `app.ts` directly - the running containers will auto-compile
2. ⚠️ **Not Recommended**: Manually editing `app.js` (will be overwritten on next TS compile)
3. 🔄 **After Changes**: No action needed - watch mode handles everything
4. 🧪 **Testing**: Visit http://localhost:8080 or ask user to check

### Verifying Environment Status:

```bash
# Check if containers are running
wsl bash -c "docker ps --filter name=poker-trainer"

# Check compiler logs
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs typescript-compiler"

# Check web server logs
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs web-server"

# Full logs
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs -f"
```

## Troubleshooting

### Docker Service Not Running
```bash
wsl bash -c "sudo service docker start"
```

### Containers Not Starting
```bash
# Stop and remove all containers
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose down"

# Rebuild from scratch
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up --build"
```

### TypeScript Not Compiling
```bash
# Check compiler container logs
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs typescript-compiler"

# Restart compiler container
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose restart typescript-compiler"
```

### Port 8080 Already in Use
```bash
# Find what's using the port
wsl bash -c "lsof -i :8080"

# Or change port in docker-compose.yml:
# Change "8080:8080" to "8081:8080" (host:container)
```

### File Permission Issues
```bash
# Set proper permissions (run from WSL)
cd /mnt/c/Users/ph1c/dev/poker_trainer
chmod +x dev-start.sh
```

## Initial Setup (For New Systems)

If this is a fresh setup or new AI context:

### 1. Verify WSL Access:
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && pwd"
# Should output: /mnt/c/Users/ph1c/dev/poker_trainer
```

### 2. Verify Docker:
```bash
wsl bash -c "docker --version"
# Should output: Docker version 28.5.1 or similar
```

### 3. Test Build:
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose build"
```

### 4. Start Services:
```bash
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up -d"
```

### 5. Verify Running:
```bash
wsl bash -c "docker ps"
# Should show 2 containers: poker-trainer-compiler and poker-trainer-server
```

## Network Access

- **Development Server**: http://localhost:8080
- **Host**: Accessible from Windows browser
- **Container Network**: `poker-dev` (bridge mode)
- **Inter-container Communication**: Yes, via service names

## Performance Notes

- **Compilation Speed**: ~1-2 seconds for typical changes
- **Live Reload Delay**: ~1-2 seconds after compilation
- **Initial Build**: ~30-60 seconds (downloads base images)
- **Subsequent Builds**: ~5-10 seconds (uses cache)

## Security Considerations

- Containers run in isolated network (`poker-dev`)
- No privileged mode required
- Volume mounts are read-write (needed for compilation output)
- Web server binds to `0.0.0.0` (accessible from host)
- Development environment only (not for production)

## Future AI Assistant Context

When starting a new conversation:

1. **Check if dev environment is running**:
   ```bash
   wsl bash -c "docker ps --filter name=poker-trainer"
   ```

2. **If not running, start it**:
   ```bash
   wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up -d"
   ```

3. **Make your changes to `app.ts`**

4. **Verify compilation**:
   ```bash
   wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs typescript-compiler --tail 20"
   ```

5. **Inform user to check** http://localhost:8080

## Quick Reference Card

| Action | Command |
|--------|---------|
| Start dev | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up -d"` |
| Stop dev | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose down"` |
| View logs | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs -f"` |
| Restart | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose restart"` |
| Rebuild | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up --build"` |
| Quick compile | `wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && ./compile.bat"` |
| Check status | `wsl bash -c "docker ps"` |

---

**Last Updated**: October 18, 2025  
**Docker Version**: 28.5.1  
**Environment**: Windows 10/11 + WSL2 (Ubuntu) + Docker Engine

