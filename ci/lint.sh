#!/usr/bin/env bash

# Hint: in order to have permission to run this script inside gitlab CI/CD, you have to mark this file as executable "git add --chmod=+x ci/test\:unit.sh"

YELLOW='\e[0;33m'
NC='\e[0m'
MAINTEXT='\e[1;33m'
TEXT='\e[21m'

HINT="
${YELLOW}=============================================================
${MAINTEXT}Format files and automatically fix fixable problems with these commands:${TEXT}
    meteor npm run lint:fix
${YELLOW}=============================================================${NC}
"

echo -e "${HINT}"

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run lint

echo -e "\e[1;33mIf you have random errors and problems inside the gitlab runner, try to click "Clear runner caches" button in https://gitlab.com/Openki/Openki/-/pipelines.\e[0m"

meteor npm run type-check

echo -e "${HINT}"
