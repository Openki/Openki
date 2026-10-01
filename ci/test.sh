#!/usr/bin/env bash

# Hint: in order to have permission to run this script inside gitlab CI/CD, you have to mark this file as executable "git add --chmod=+x ci/test\:unit.sh"

YELLOW='\e[33m'
BOLD='\e[1m'
RESET='\e[0m'

HINT="
${YELLOW}=============================================================
${BOLD}Run tests with:${RESET}
    ${YELLOW}meteor npm run test
    or meteor npm run test:ui

Check out https://cloud.cypress.io/projects/4icmbi to see more details about the test runs
=============================================================${RESET}
"

echo -e "${HINT}"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

# Uncomment if you need to debug which Debian packages are included in the CI container:
# dpkg -l

meteor npm ci
meteor node -v && meteor npm version

meteor npm run test:ci

echo -e "${HINT}"
