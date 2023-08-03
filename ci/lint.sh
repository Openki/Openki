#!/bin/bash

echo -e "\e[1;33mFormat files and automatically fix fixable problems with these commands:\e[21m
    meteor npm run es-lint -- --fix
    meteor npm run sass-lint -- --fix\e[0m"

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run sass-lint

meteor npm run es-lint

meteor npm run type-check
