@echo off
REM Development environment startup script for Windows

echo.
echo Starting Poker Range Trainer Development Environment...
echo.

REM Navigate to project directory
cd /d "%~dp0"

echo Building and starting containers via WSL...
wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose up --build -d"

echo.
echo Development environment is starting!
echo.
echo Access your app at: http://localhost:8080
echo.
echo Useful commands:
echo   View logs:        wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose logs -f"
echo   Stop containers:  wsl bash -c "cd /mnt/c/Users/ph1c/dev/poker_trainer && docker compose down"
echo.
echo TypeScript files will auto-compile when you save changes!
echo The browser will auto-reload when files change!
echo.
pause

