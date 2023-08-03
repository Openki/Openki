#!/bin/bash

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run sass-lint

meteor npm run es-lint

meteor npm run type-check

# Format files and automatically fix fixable problems with these commands:
#     meteor npm run es-lint -- --fix
#     meteor npm run sass-lint -- --fix
