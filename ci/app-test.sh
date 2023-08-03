#!/bin/bash

echo "Run app-tests with:"
echo "    meteor npm run app-test"
echo "or  meteor npm run test-live"

set -xe

Xvfb "${DISPLAY}" -screen 0 1024x768x24 > /dev/null 2>&1 &

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run app-test
