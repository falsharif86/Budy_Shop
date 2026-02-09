# Stage 1: Build
FROM node:22-alpine AS builder

# Build arguments for version information
ARG BUILD_VERSION=0.1.0-dev
ARG GIT_COMMIT=unknown
ARG BUILD_TIME
ARG GIT_BRANCH=main

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set version env for SvelteKit build
ENV PUBLIC_BUILD_VERSION=${BUILD_VERSION}
ENV PUBLIC_GIT_COMMIT=${GIT_COMMIT}
ENV PUBLIC_BUILD_TIME=${BUILD_TIME}
ENV PUBLIC_GIT_BRANCH=${GIT_BRANCH}

# Build for production
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Build arguments (re-declare for runtime stage)
ARG BUILD_VERSION=0.1.0-dev
ARG GIT_COMMIT=unknown
ARG BUILD_TIME
ARG GIT_BRANCH=main

# Copy built output
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV BUILD_VERSION=${BUILD_VERSION}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BUILD_TIME=${BUILD_TIME}
ENV GIT_BRANCH=${GIT_BRANCH}

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=10s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Start
CMD ["node", "build"]
