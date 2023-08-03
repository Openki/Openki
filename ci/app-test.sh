#!/bin/bash

echo -e "\e[1;33mRun app-tests with:\e[0m"
echo -e "\e[33m    meteor npm run app-test\e[0m"
echo -e "\e[33mor  meteor npm run test-live\e[0m"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run app-test
