# ServerPublish

> Originally part of the Openki utilities, but extracted into a Meteor package in order to allow the code to be used together with Rspack.

## How to update this package, its types and use in the Meteor app:

1. Make changes to this package.
2. Update types (run from the Openki project root directory): `meteor npx tsc -p packages/server-publish`
3. Install the new version in the app: `meteor add server-publish`
