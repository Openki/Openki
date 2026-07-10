# Just - a command runner to simplify common tasks
#
# https://github.com/casey/just#readme
#
# Purpose of this file:
# This file can be executed by `just` to reduce repeated typing for common tasks.
#
# Get started:
# 1) Install `just` via your package manager: https://github.com/casey/just#installation
# 2) Run `just` to list available commands.
# 3) Run commands like for example `just dev` to start the dev server.
# 4) Update this file and add more useful commands.

set default-list

# Install npm and Meteor Atmosphere packages
install:
    meteor npm install

# Start the development server
dev:
    meteor npm run debug

# Fix linting errors and warn for serious problems
fix:
    meteor npm run lint:fix

# Run linting and type checking
check:
    meteor npm run type-check

# Start the Cypress UI for running tests
test-ui:
    meteor npm run test:ui
