#!/bin/bash
YELLOW='\033[0;33m'
NC='\e[0m'
MAINTEXT='\e[1;33m'
TEXT='\e[21m'

echo ""
echo -e "${YELLOW}=============================================================${NC}"
echo -e "${MAINTEXT}Run tests with:${TEXT}
    meteor npm run test:unit${NC}"
echo -e "${YELLOW}=============================================================${NC}"
echo ""

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

which chromium
dpkg -l
meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run test:unit
