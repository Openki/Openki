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

export COMPOSE_FILE := 'docker-compose.local.yml'
export METEOR_NO_RELEASE_CHECK := 'true'
export ENV_FILE := '.env.local'
export LOCALHOST_SSL_CERT := 'docker/caddy/localhost.pem'
export LOCALHOST_SSL_KEY := 'docker/caddy/localhost-key.pem'

# Combined installation of both npm and Meteor Atmosphere packages.
# Optionally include `ARGS` to install specific npm package(s):
# Example: `just install react react-dom`
# You can also pass flags like normal: `just install -D @types/react`
[doc("Install npm and Meteor Atmosphere packages")]
install *ARGS:
    meteor npm install {{ ARGS }}

# Start the Meteor development server
[no-exit-message]
dev:
    npm run dev:startup
    NODE_OPTIONS="--no-experimental-webstorage" meteor run --inspect --settings settings/local.json

[doc("""
Start the Meteor development server and enable localhost SSL features.

To use this command:
1) Start the ssl-proxy service with `just docker-dev ssl` (in a separate terminal).
2) Run `just ssl-dev` to start the Meteor dev server with local SSL enabled.
3) Access the app via https://localhost:3443
""")]
[no-exit-message]
ssl-dev:
    #!/usr/bin/env bash
    set -euo pipefail
    # Ensure the ssl-proxy is running, since SSL only works when connecting through it.
    if ! docker ps --format '{{{{.Names}}}}' | grep -q 'ssl-proxy'; then
        printf "Error: ssl-proxy service is not running\n\nStart it in a separate terminal:\n\njust docker-dev ssl\n\n" >&2
        exit 1
    fi
    meteor npm run dev:startup
    ROOT_URL=https://localhost:3443 OPENKI_LOCALHOST_SSL=1 meteor run \
      --inspect \
      --settings settings/local.json \
      --port 3000

# Main docker compose wrapper with common config
compose *ARGS:
    docker compose -f {{ COMPOSE_FILE }} --env-file {{ ENV_FILE }} {{ ARGS }}

# Stop all docker dev containers, including the SSL proxy if it is running.
stop-all-docker-containers:
    docker compose -f {{ COMPOSE_FILE }} --env-file {{ ENV_FILE }} --profile ssl stop

[doc("""
Start the containerized local development environment.

By default this starts the local S3 instance for image uploads.

To also start a localhost SSL proxy, run `just docker-dev ssl`
""")]
docker-dev PROFILE="":
    #!/usr/bin/env bash
    case "{{ PROFILE }}" in
        "")
            docker compose -f {{ COMPOSE_FILE }} --env-file {{ ENV_FILE }} up
            ;;
        ssl)
            if [[ ! -f {{ LOCALHOST_SSL_CERT }} || ! -f {{ LOCALHOST_SSL_KEY }} ]]; then
                printf "\nMissing SSL certificate. Please generate a local SSL certificate:\n\njust setup-localhost-ssl\n\n" >&2
                exit 1
            fi
            docker compose --profile ssl -f {{ COMPOSE_FILE }} --env-file {{ ENV_FILE }} up
            ;;
        *)
            printf "\nUnknown docker compose profile: %s\n\n" "{{ PROFILE }}" >&2
            exit 1
            ;;
    esac

[doc("""
Delete the containerized local development environment. Useful to remove old containers before a rebuild.

Pass `--volumes` to also delete all persisted data. This clears the local S3 storage.
""")]
delete-docker-dev *ARGS:
    docker compose -f {{ COMPOSE_FILE }} --env-file {{ ENV_FILE }} down --rmi local {{ ARGS }}

# Fix linting and formatting errors and warn for serious problems.
fix:
    npm run lint:fix || just oxlint-errors

# Run linting and type checking
check:
    npm run lint || just oxlint-errors && npm run type-check

# Only print the oxlint errors so they are easier to find and fix.
oxlint-errors:
    npx oxlint --quiet

# Extract translations into i18n files
translations:
    npm run extract-translations

# Find errors in translations and print warnings and errors
check-translations:
    npm run lint:translations

# Start the Cypress UI for running tests, debugging and interactively recording new tests
[no-exit-message]
test-ui:
    npm run test:ui

# Run all tests with a headless browser
test:
    npm run test

[doc("""
Run only specific tests in a headless browser.

For example, a glob like `**/Api*` or a full path like `tests/component/Navbar.spec.ts`
""")]
test-only *ARGS:
    npx start-test 'npm run test:env' :3000 'cypress run --spec {{ ARGS }}'

# List npm dependencies that have new versions available
[no-exit-message]
outdated:
    npm outdated

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
[no-exit-message]
preview-emails:
    python scripts/preview-emails.py .temp/ 4000

# Remove emails created by the dev server.
reset-emails:
    rm -f .temp/*.html

# After confirmation, remove all cached Meteor packages except the most recent version.
delete-old-meteor-packages:
    bash scripts/delete-old-meteor-packages.sh

# Refresh local Meteor packages and restart the app with their latest changes
refresh-packages: reset dev

[doc("""
Run this script once to make it possible to run the local dev server with HTTPS.

This is useful for testing in production-like circumstances, and required for
developing and testing OAuth integrations.

Requirements: Install `mkcert` - https://github.com/FiloSottile/mkcert
""")]
setup-localhost-ssl:
    #!/usr/bin/env bash
    set -euo pipefail
    # 1) Ensure mkcert is installed
    command -v mkcert >/dev/null 2>&1 || {
      printf >&2 "\nError: Please install mkcert - https://github.com/FiloSottile/mkcert\n\n"
      exit 1
    }
    # 2) Install a local certificate authority (CA) in the system trust store.
    #    This will prompt you for sudo access.
    #    Only need to be done once per computer, but included here for simplicity.
    mkcert -install
    # 3) Create a SSL certificate and private key for https://localhost
    mkcert -cert-file {{ LOCALHOST_SSL_CERT }} -key-file {{ LOCALHOST_SSL_KEY }} localhost

alias i := install
alias d := dev
alias f := fix
alias c := check
alias t := test-ui
alias o := outdated
alias a := audit
alias r := reset
