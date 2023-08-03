#!/bin/bash

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run sass-lint

meteor npm run es-lint

meteor npm run type-check

echo "Format files and automatically fix fixable problems with these commands:"
echo "    meteor npm run es-lint -- --fix"
echo "    meteor npm run sass-lint -- --fix"
