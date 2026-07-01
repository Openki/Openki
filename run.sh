#!/usr/bin/env bash
set -euo pipefail

# Prerequisite: build the image first with ./build.sh
# (this script does NOT build for you — it only runs openki-app:latest)

IMAGE="openki-app:latest"

if ! docker image inspect "${IMAGE}" > /dev/null 2>&1; then
  echo "✖ Image '${IMAGE}' not found locally." >&2
  echo "  Run ./build.sh first, then try again." >&2
  exit 1
fi

METEOR_SETTINGS=$(cat ./settings/dev.json) docker compose up