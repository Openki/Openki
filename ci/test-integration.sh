#!/bin/bash

YELLOW='\033[0;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}=============================================================${NC}"
echo -e "\e[1;33mRun integration tests with:\e[21m
    meteor npm run test:integration
    or  meteor npm run test:integration:watch (to run and witness it in your local browser: open https://localhost:3000/) \e[0m

    If integration tests are run in a docker container, it needs a headless chromium to work"
echo -e "${YELLOW}=============================================================${NC}"
echo ""

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

which chromium
dpkg -l
meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run test:integration
