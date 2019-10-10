#!/bin/bash

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run sass-lint
meteor npm run eslint

meteor npm run test

meteor npm run app-test
