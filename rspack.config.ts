import { defineConfig } from "@meteorjs/rspack";

import { createRequire } from "node:module";
const require = createRequire(import.meta.filename);

export default defineConfig(() => ({
  // Enable verbose Rspack logging
  stats: "detailed",
  infrastructureLogging: {
    level: "info",
  },
  resolve: {
    // Skip resolution for `node:*` built-in modules when building the client
    fallback: {
      path: false,
      util: false,
      stream: false,
      assert: false,
    },
  },
  module: {
    rules: [
      // Load SASS
      {
        test: /\.scss$/i,
        use: [
          {
            loader: "sass-loader",
            options: {
              // Preserve the old behavior with global variables that are available even in nested modules.
              // This removes the need for a lot of SCSS code changes.
              // We anyway plan to change styling solution in the future.
              api: "modern-compiler",
              implementation: require("sass-embedded"),
              sassOptions: {
                // Silence deprecations in bootstrap that we can not change.
                quietDeps: true,
              },
              // Lets `@import "imports/ui/..."` (without {}) resolve from the project root
              // includePaths: [projectRoot],
              // importer(url: string) {
              //   if (url.startsWith("{}/")) {
              //     // Translate the old Meteor SCSS `{}` import syntax to the project root
              //     return { file: join(projectRoot, url.slice(3)) };
              //   }
              //   // Fall back to normal resolution
              //   return null;
              // },
              // Replicate the package's "globals available everywhere" behavior:
              // prepend the variables import to every compiled file
              // additionalData(content, loaderContext) {
              //   console.log(loaderContext.resourcePath);
              //   const resourcePath = loaderContext.resourcePath.replace(/\\/g, "/");
              //   if (
              //     resourcePath.endsWith("stylesheets/variables/index.scss") ||
              //     content.includes("imports/ui/stylesheets/variables")
              //   ) {
              //     return content.toString();
              //   }
              //   return '@import "imports/ui/stylesheets/variables/index" as *;\n' + content;
              // },
            },
          },
        ],
        type: "css",
      },
    ],
  },
}));
