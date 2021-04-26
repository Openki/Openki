#!/bin/bash

set -xe

meteor update --patch
meteor npm i
meteor node -v && meteor npm version

meteor npm run sass-lint

meteor npm run es-lint
