import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "4icmbi",
  e2e: {
    baseUrl: "http://localhost:3000",
    // we use cypress e2e environment for all kinds of test
    specPattern: "tests/{unit,component,api,e2e}/**/*.spec.ts",
    supportFile: "tests/support/index.ts",
    // Running multiple tests at the same time with `experimentalRunAllSpecs` can be unreliable
    // and cause tests to fail in weird ways.
    // experimentalRunAllSpecs: true,
    screenshotsFolder: "tests/screenshots",
    videosFolder: "tests/videos",
    video: false,
    retries: {
      runMode: 2,
      openMode: 1,
    },
    setupNodeEvents() {
      // Implement node event listeners here
      // Register plugins here, if necessary
      // Example: Code coverage or reporting
      // return require(“./tests/cypress/plugins/index.ts”)(on, config);
    },
    env: {
      baseUrl: "http://localhost:3000",
      codeCoverage: { url: "http://localhost:3000/__coverage__" },
    },
  },
});
