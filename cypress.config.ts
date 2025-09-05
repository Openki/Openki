import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "4icmbi",
  e2e: {
    baseUrl: "http://localhost:4000",
    // we use cypress e2e environment for all kinds of test
    specPattern: "tests/cypress/{unit,e2e}/**/*.spec.ts",
    supportFile: "tests/cypress/support/index.ts",
    experimentalStudio: true,
    screenshotsFolder: "tests/cypress/screenshots",
    videosFolder: "tests/cypress/videos",
    video: false,
    retries: {
      runMode: 2,
      openMode: 1,
    },
    setupNodeEvents() {
      // implement node event listeners here
      // Plugins hier registrieren, falls nötig
      // Beispiel: Code Coverage oder Reporting
      // return require("./tests/cypress/plugins/index.ts")(on, config);
    },
    env: {
      baseUrl: "http://localhost:4000",
      codeCoverage: { url: "http://localhost:4000/__coverage__" },
    },
  },
});
