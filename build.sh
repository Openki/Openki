#!/usr/bin/env bash
# build-and-push.sh
# Usage: ./build-and-push.sh [tag]
# Example: ./build-and-push.sh 1.0.0
 
set -euo pipefail

# Hardcoded image name
IMAGE="openki-app"
 
# Validates that a tag was passed as the first argument
TAG="${1:?Usage: $0 [tag]}"
FULL="${IMAGE}:${TAG}"
 
# 1. Build the image
echo "▶ Building ${FULL} …"
docker build \
  --tag "${FULL}" \
  .

echo "✔ Done!"