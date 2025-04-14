#!/bin/bash

echo -e "\e[1;33mRun app-tests with:\e[21m
    meteor npm run app-test
    or  meteor npm run test-live\e[0m"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

chromium --version
chromium-browser --version
meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run app-test
