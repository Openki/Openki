#!/bin/bash

# Ensure dependencies are installed in the container before starting the dev server
exec meteor npm install
exec meteor npm run debug
