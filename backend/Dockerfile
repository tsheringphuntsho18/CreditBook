# Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose the API port
EXPOSE 3001

# Run migrations then start the server
CMD ["node", "src/index.js"]
