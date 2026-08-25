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

# Start the containerized local development environment
docker-dev:
    docker compose -f docker-compose.dev.yml --env-file .env.dev up --force-recreate --always-recreate-deps

docker-watch:
    docker compose -f docker-compose.dev.yml --env-file .env.dev

# Fully rebuild the docker containers
docker-dev-rebuild:
    docker compose -f docker-compose.dev.yml --env-file .env.dev up --force-recreate --always-recreate-deps --build --no-cache

# Fix linting and formatting errors and warn for serious problems.
fix:
    meteor npm run lint:fix || just oxlint-errors

# Run linting and type checking
check:
    meteor npm run lint || just oxlint-errors && meteor npm run type-check

# Only print the oxlint errors so they are easier to find and fix.
oxlint-errors:
    meteor npx oxlint --quiet

# Extract translations into i18n files
translations:
    meteor npm run extract-translations

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

[doc("""
Audit dependencies against known security vulnerabilities.

IMPORTANT: This does not check the bundled Meteor dependencies,
so this command only reports a small fraction of the actual vulnerabilities.
""")]
[no-exit-message]
audit:
    meteor npm audit

# Reset meteor cache. Pass `--db` to also reset the local MongoDB.
reset *ARGS:
    meteor reset {{ ARGS }}

# Preview HTML emails in the browser
preview-emails:
    python -m http.server --directory .temp/ 8080

alias i := install
alias d := dev
alias t := test-ui
alias o := outdated
alias a := audit
