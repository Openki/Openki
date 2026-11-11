#!/bin/bash

# Ensure dependencies are installed in the container before starting the dev server
meteor npm install

# Run startup scripts
meteor npm run dev:startup
# Start the dev server and connect to debug port
# Use the the docker-local.json settings in order to connect to the local Garage S3 container.
meteor --inspect=0.0.0.0:$INSPECT_PORT --settings settings/docker-local.json
