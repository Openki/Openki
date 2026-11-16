import { defineConfig } from "@meteorjs/rspack";
// import { resolve } from "node:path";

export default defineConfig(() => ({
  // Enable verbose Rspack logging
  stats: "detailed",
  infrastructureLogging: {
    level: "info",
  },

  // Attempt to enable rspack
  // resolve: {
  //   alias: {
  //     "/": resolve(import.meta.dirname, "imports"),
  //     "@swc/helpers/_": resolve(import.meta.dirname, "node_modules/@swc/helpers/esm"),
  //   },
  //   modules: [resolve(import.meta.dirname, "node_modules"), "node_modules"],
  //   conditionNames: ["module-sync", "webpack", "import", "default"],
  // },
  module: {
    rules: [
      // Load SASS
      {
        test: /\.scss$/i,
        use: [
          {
            loader: "sass-loader",
            options: {
              api: "modern-compiler",
              implementation: import.meta.resolve("sass-embedded"),
            },
          },
        ],
        type: "css/auto",
      },
      // Load PostCSS
      {
        test: /\.css$/,
        use: ["postcss-loader"],
        type: "css",
      },
    ],
  },
}));
