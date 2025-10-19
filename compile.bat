@echo off
echo Compiling TypeScript using Docker...
docker build -t poker-trainer-builder .
docker create --name poker-temp poker-trainer-builder
docker cp poker-temp:/app/app.js .
docker rm poker-temp
echo Done! You can now open index.html in your browser.

