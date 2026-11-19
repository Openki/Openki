import { defineConfig } from "@meteorjs/rspack";

import { createRequire } from "node:module";
const require = createRequire(import.meta.filename);

export default defineConfig((Meteor) => ({
  // Enable verbose Rspack logging
  stats: "detailed",
  infrastructureLogging: {
    level: "info",
  },
  ...Meteor.extendSwcConfig({
    jsc: {
      ...Meteor.swcConfigOptions.jsc,
      transform: {
        ...Meteor.swcConfigOptions.jsc?.transform,
        react: {
          ...Meteor.swcConfigOptions.jsc?.transform?.react,
          runtime: "automatic",
        },
      },
    },
  }),
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
      // Let Rspack handle regular CSS
      {
        test: /\.css$/i,
        type: "css",
        use: ["builtin:lightningcss-loader"],
      },
      // Load SASS
      {
        test: /\.scss$/i,
        use: [
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              implementation: require("sass-embedded"),
              sassOptions: {
                // Silence deprecations in bootstrap that we can not change.
                quietDeps: true,
              },
            },
          },
        ],
        type: "css",
      },
    ],
  },
}));
