# ============================================================================
# MeiLearning Frontend — Multi-stage Docker Build
# ============================================================================

# ── Stage 1: Build ─────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build arg for Vite env vars (baked in at build time)
ARG VITE_API_BASE_URL=/api/v1

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing: redirect all paths to index.html
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    client_max_body_size 10M; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
    location /uploads/ { \
        proxy_pass http://backend:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
