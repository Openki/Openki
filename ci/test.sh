#!/bin/bash

echo -e "\e[1;33mRun tests with:\e[21m
    meteor npm run test\e[0m"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

which chromium-browser
which chromium
hostnamectl
dpkg -l
meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run test
