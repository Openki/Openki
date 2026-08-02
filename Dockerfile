# ─────────────────────────────────────────────
# Stage 1 – Builder
# Uses the official Meteor base image to install
# dependencies and produce a self-contained bundle.
# ─────────────────────────────────────────────
FROM geoffreybooth/meteor-base:3.4 AS builder

# Copy the full source into the image
WORKDIR /app
COPY . .

# Install Meteor packages
RUN meteor npm ci

# Build the production bundle
# Output goes to /build as a standard Node app
RUN meteor build --directory /build --server-only --allow-superuser


# ─────────────────────────────────────────────
# Stage 2 – Runtime
# Lean Node image that just runs the bundle.
# ─────────────────────────────────────────────
FROM node:22-slim AS runtime

# Required by Meteor bundles
ENV PORT=3000 \
    NODE_ENV=production

# Fibers / native modules need a build toolchain
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled bundle from the builder stage
COPY --from=builder --chown=node:node /build/bundle .

# Switch to non-root before installing/running anything app-related
USER node


# Install server-side npm dependencies that Meteor bundled
RUN cd programs/server && npm install --omit=dev

EXPOSE 3000

CMD ["node", "main.js"]
