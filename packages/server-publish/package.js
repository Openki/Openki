Package.describe({
  name: "server-publish",
  summary: "Helpers to use Meteor publications with Blaze and React",
  version: "1.0.0",
  documentation: "README.md",
  git: "https://gitlab.com/Openki/Openki",
});

Package.onUse(function (api) {
  api.versionsFrom("3.6.1");
  api.use("ecmascript");
  api.use("typescript");
  api.use("mongo");
  api.use("react-meteor-data");

  Npm.depends({
    // This version should match the version used by the root package.json
    // to avoid duplicate dependencies in the built app.
    "es-toolkit": "1.53.2",
  });

  // The fix that allows usage with Rspack is to explicitly compile all modules for both client and server.
  api.addFiles("./server-publish-utils.ts", ["client", "server"]);
  api.addFiles("./server-publish-blaze.ts", ["client", "server"]);
  api.addFiles("./server-publish-react.ts", ["client", "server"]);
  api.addFiles("./server-publish.ts", ["client", "server"]);
  api.mainModule("index.ts", ["client", "server"], { lazy: true });

  api.types("types/index.d.ts");
});
