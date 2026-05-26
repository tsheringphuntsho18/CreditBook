# ── Frontend Dockerfile (multi-stage) ──────────────────────────────────────────

# Stage 1 – Build the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

# Accept the backend URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2 – Serve with Nginx
FROM nginx:alpine

# Copy the built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for SPA (React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
