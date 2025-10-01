#!/usr/bin/env bash

# Hint: in order to have permission to run this script inside gitlab CI/CD, you have to mark this file as executable "git add --chmod=+x ci/test\:unit.sh"

YELLOW='\e[0;33m'
NC='\e[0m'
MAINTEXT='\e[1;33m'
TEXT='\e[21m'

HINT="
${YELLOW}=============================================================
${MAINTEXT}Run tests with:${TEXT}
    meteor npm run test
    or meteor npm run test:ui

Check out https://cloud.cypress.io/projects/4icmbi to see more details about the test runs
${YELLOW}=============================================================${NC}
"

echo -e "${HINT}"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

dpkg -l
meteor update --patch
meteor npm ci
meteor node -v && meteor npm version

meteor npm run test:ci

echo -e "${HINT}"
