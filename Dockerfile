FROM node:18-alpine

WORKDIR /app

# Install TypeScript globally
RUN npm install -g typescript

# Copy the TypeScript file
COPY app.ts .

# Compile TypeScript
RUN tsc app.ts --target ES6 --lib ES2015,DOM --strict

# The compiled JavaScript file will be in /app/app.js

