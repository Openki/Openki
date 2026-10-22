# Just - a command runner to simplify common tasks
#
# https://github.com/casey/just#readme
#
# This file can be executed with `just` and is useful for the following reasons:
# - To reduce repeated typing for common tasks.
# - To document dev commands.
#
# Get started:
# 1) Install `just` via your package manager: https://github.com/casey/just#installation
# 2) Run `just` to list available commands.
# 3) Run commands like `just dev` to start the dev server.
# 4) Update this file so it includes the most useful commands
#    and short descriptions of how why and how they are used.

set default-list

# Combined installation of both npm and Meteor Atmosphere packages.
# Optionally include `ARGS` to install specific npm package(s):
# Example: `just install react react-dom`
# You can also pass flags like normal: `just install -D @types/react`
[doc("Install npm and Meteor Atmosphere packages")]
install *ARGS:
    meteor npm install {{ ARGS }}

# Start the development server
[no-exit-message]
dev:
    meteor npm run debug

# Fix linting and formatting errors and warn for serious problems
fix:
    meteor npm run lint:fix

# Only run the regular linting
lint:
    meteor npm run lint

# Extract translations into i18n files
translations:
    meteor npm run extract-translations

# Run linting and type checking
check:
    meteor npm run lint && meteor npm run type-check

# Start the Cypress UI for running tests, debugging and interactively recording new tests
[no-exit-message]
test-ui:
    meteor npm run test:ui

# Run all tests with a headless browser
test:
    meteor npm run test

# Run only specific tests in a headless browser.
# For example, `tests/component/Navbar.spec.ts`
test-only *ARGS:
    meteor npx start-test 'npm run test:env' :3000 'cypress run --spec {{ ARGS }}'

# List npm dependencies that have new versions available
[no-exit-message]
outdated:
    meteor npm outdated

# Reset meteor cache. Pass `--db` to also reset the local MongoDB.
reset *ARGS:
    meteor reset {{ ARGS }}

alias i := install
alias d := dev
alias t := test-ui
alias o := outdated
