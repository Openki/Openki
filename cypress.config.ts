import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4000",
    specPattern: "tests/cypress/integration/tests/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/cypress/support/index.js",
    screenshotsFolder: "tests/cypress/screenshots",
    videosFolder: "tests/cypress/videos",
    video: false,
    retries: {
      runMode: 2,
      openMode: 1,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // falls Plugins benötigt werden:
      return require("./tests/cypress/plugins/index.js")(on, config);
    },
    env: {
      baseUrl: "http://localhost:4000",
      codeCoverage: { url: "http://localhost:4000/__coverage__" },
    },
  },
  fixturesFolder: "tests/cypress/fixtures",
});
