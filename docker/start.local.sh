#!/bin/bash

# Ensure dependencies are installed in the container before starting the dev server
exec meteor --no-release-check npm install
exec meteor --no-release-check npm run debug
