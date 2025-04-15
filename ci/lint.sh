#!/bin/bash

echo -e "\e[1;33mFormat files and automatically fix fixable problems with these commands:\e[21m
    meteor npm run lint:fix\e[0m"

set -xe

meteor update
meteor npm i
meteor node -v && meteor npm version

meteor npm run lint

meteor npm run type-check
