import { defineConfig } from "cypress";
import { x } from "tinyexec";
import { homedir } from "node:os";

/** Resolve absolute paths by replacing `~` with `$HOME` */
function resolveHomedir(path: string) {
  if (path.startsWith("~/") || path === "~") {
    return path.replace("~", homedir());
  }
  return path;
}

/** Parse the output from `browser --version` into the Cypress format */
type BrowserParser = (rawVersion: string, binaryPath: string) => Cypress.Browser;

/**
 * Get information about a local browser in the format Cypress expects.
 *
 * @returns Browser info if the binary exists in the `$PATH`, or `false` if no match found.
 */
async function getBrowserInfo(
  browserBinaryName: string,
  browserParser: BrowserParser,
): Promise<Cypress.Browser | false> {
  try {
    const unresolvedPath = await x("which", [browserBinaryName], { throwOnError: true });
    const binaryPath = resolveHomedir(unresolvedPath.stdout).trim();
    const rawVersion = await x(binaryPath, ["--version"], { throwOnError: true });

    return browserParser(rawVersion.stdout.trim(), binaryPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Ignore errors since the browser most likely doesn't exist.
    // NOTE: Uncomment the following line if you want to add or debug a local browser:
    // console.error(error);
  }

  return false;
}

function parseVersion(rawVersion: string, regex: RegExp) {
  const [version] = rawVersion.match(regex)?.slice(1) ?? [];
  if (!version) {
    throw new Error("Failed to match version: " + rawVersion);
  }
  const majorVersion = parseInt(version.split(".")[0]);

  return { version, majorVersion };
}

/**
 * Add custom browsers to allow running tests in specific browsers.
 */
async function findAdditionalBrowsers(): Promise<Cypress.Browser[]> {
  /**
   * Map of browser binaries e.g. `helium`,
   * and a parser function to determine the version and other details.
   */
  const potentialBrowsers: Record<string, BrowserParser> = {
    helium: (rawVersion, binaryPath) => {
      // Example: "Helium 0.16.6.1 (Chromium 152.0.7977.82)" matches "152.0.7977.82"
      const { version, majorVersion } = parseVersion(rawVersion, /Helium \S+ \(Chromium (\S+)\)/);

      return {
        name: "Helium",
        displayName: "Helium",
        family: "chromium",
        channel: "stable",
        path: binaryPath,
        version,
        majorVersion,
        isHeaded: true,
        isHeadless: false,
      };
    },
    brave: (rawVersion, binaryPath) => {
      // Example: "Brave Browser 77.0.69.135" matches "77.0.69.135"
      const { version, majorVersion } = parseVersion(
        rawVersion,
        /Brave Browser (\d+\.\d+\.\d+\.\d+)/,
      );

      return {
        name: "Brave",
        channel: "stable",
        family: "chromium",
        displayName: "Brave",
        version,
        path: binaryPath,
        majorVersion,
        isHeaded: true,
        isHeadless: false,
      };
    },
  };

  const additionalBrowsers = await Promise.all(
    Object.entries(potentialBrowsers).map(async ([browserBinaryName, parser]) =>
      getBrowserInfo(browserBinaryName, parser),
    ),
  );

  return additionalBrowsers.filter(Boolean) as Cypress.Browser[];
}

export default defineConfig({
  projectId: "4icmbi",
  defaultBrowser: "firefox",
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
    async setupNodeEvents(_on, config) {
      // Implement node event listeners here
      // Register plugins here, if necessary
      // Example: Code coverage or reporting
      // return require(“./tests/cypress/plugins/index.ts”)(on, config);

      const additionalBrowsers = await findAdditionalBrowsers();
      if (additionalBrowsers.length === 0) {
        return config;
      }

      return {
        ...config,
        browsers: [...config.browsers, ...additionalBrowsers],
      };
    },
    env: {
      baseUrl: "http://localhost:3000",
      codeCoverage: { url: "http://localhost:3000/__coverage__" },
    },
  },
});
