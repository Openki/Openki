import { defineConfig } from "@meteorjs/rspack";
// import { resolve } from "node:path";

export default defineConfig(() => ({
  // Enable verbose Rspack logging
  stats: "detailed",
  infrastructureLogging: {
    level: "info",
  },
  module: {
    rules: [
      // Load SASS
      {
        test: /\.scss$/i,
        use: [
          {
            // TODO: All sass imports need to be updated
            // We also need to explicitly refer to variables by prefixing with the module name.
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              implementation: import.meta.resolve("sass-embedded"),
              // Silence deprecations in bootstrap that we can not change.
              quietDeps: true,
            },
          },
        ],
        type: "css",
      },
      // Load PostCSS
      // NOTE: Since we don't use any regular CSS files, do we need to have postcss anymore?
      // TODO: Check how Rspack handles autoprefixer. Maybe it is already included in Rspack itself?
      // {
      //   test: /\.css$/,
      //   use: ["postcss-loader"],
      //   type: "css",
      // },
    ],
  },
}));
