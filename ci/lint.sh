#!/usr/bin/env bash

# Hint: in order to have permission to run this script inside gitlab CI/CD, you have to mark this file as executable "git add --chmod=+x ci/test\:unit.sh"

echo -e "\e[1;33mFormat files and automatically fix fixable problems with these commands:\e[21m
    meteor npm run lint:fix\e[0m"

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run lint

meteor npm run type-check
