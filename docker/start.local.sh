#!/bin/bash

# Ensure dependencies are installed in the container before starting the dev server
exec meteor --no-release-check npm install \
  # Run important tasks before
  && meteor --no-release-check npm run dev:startup \
  # Start the dev server and connect to debug port
  # Use the the docker-dev.json settings in order to connect to the local Garage S3 container.
  && meteor --no-release-check --inspect=0.0.0.0:9229 --settings settings/docker-dev.json
