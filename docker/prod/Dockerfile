# Use a lightweight Node.js image
FROM node:20-alpine AS base

# Set up the working directory
WORKDIR /usr/src/backend-app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy all files from the current directory to the container
COPY . .

# Build the TypeScript project
RUN npm run dist

# Expose the application port 
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
