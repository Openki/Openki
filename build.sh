#!/usr/bin/env bash
# build.sh
 
set -euo pipefail

# Hardcoded image and tag names
IMAGE="openki-app"
TAG="latest"

FULL="${IMAGE}:${TAG}"
 
# 1. Build the image
echo "▶ Building ${FULL} …"
docker build \
  --tag "${FULL}" \
  .

echo "✔ Done!"