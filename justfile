# Just - a command runner to simplify common tasks
#
# https://github.com/casey/just#readme
#
# This file can be executed with the `just` command runner.
#
# It is useful for the following reasons:
# - To reduce repeated typing for common tasks.
# - To document dev commands.
#
# Get started:
# 1) Install `just` via your package manager: https://github.com/casey/just#installation
# 2) Run `just` to list available commands.
# 3) Run commands like for example `just dev` to start the dev server.
# 4) Update this file so it includes the most useful commands commonly needed for .

set default-list

# Install npm and Meteor Atmosphere packages
install:
    meteor npm install

# Start the development server
[no-exit-message]
dev:
    meteor npm run debug

# Fix linting and formatting errors and warn for serious problems.
fix:
    meteor npm run lint:fix

# Extract translations into i18n files
translations:
    meteor npm run extract-translations

# Run linting and type checking
check:
    meteor npm run type-check

# Start the Cypress UI for running tests
[no-exit-message]
test-ui:
    meteor npm run test:ui

# Run all tests with a headless browser
test:
    meteor npm run test

# List npm dependencies that have new versions available
[no-exit-message]
outdated:
    meteor npm outdated

alias i := install
alias o := outdated
