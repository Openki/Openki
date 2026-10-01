#!/usr/bin/env bash

# Hint: in order to have permission to run this script inside gitlab CI/CD, you have to mark this file as executable "git add --chmod=+x ci/test\:unit.sh"

YELLOW='\e[33m'
BOLD='\e[1m'
RESET='\e[0m'

HINT="
${YELLOW}=============================================================
${BOLD}Format files and automatically fix fixable problems with these commands:${RESET}
    ${YELLOW}meteor npm run lint:fix
=============================================================${RESET}
"

echo -e "${HINT}"

set -xe

meteor npm ci
meteor node -v && meteor npm version

meteor npm run lint

echo -e "${YELLOW}${BOLD}If you have random errors and problems inside the gitlab runner, try to click "Clear runner caches" button in https://gitlab.com/Openki/Openki/-/pipelines.${RESET}"

meteor npm run type-check

echo -e "${HINT}"
