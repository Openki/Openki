import { defineConfig } from "@meteorjs/rspack";
import { DefinePlugin, type SwcLoaderJscConfig } from "@rspack/core";
import { createRequire } from "node:module";

import pkg from "./package.json" with { type: "json" };

const require = createRequire(import.meta.filename);
const isLocalhostSSLEnabled = process.env.OPENKI_LOCALHOST_SSL === "1";

export default defineConfig((Meteor) => {
  const swcConfig = Meteor.extendSwcConfig({
    jsc: {
      transform: { react: { runtime: "automatic" } },
    },
  });

  // Remove Meteor's default target so we have full control over the output
  delete (swcConfig.jsc as SwcLoaderJscConfig)?.target;

  swcConfig.env = Meteor.isServer
    ? {
        targets: { node: "26" },
      }
    : {
        mode: "usage",
        coreJs: "3.51",
        targets: pkg.browserslist,
      };

  return {
    // Enable verbose Rspack logging
    // Uncomment if you need to debug something related to Rspack.
    // To debug Meteor SWC compilation, set `meteor.modern.verbose` in `package.json` to `true`.
    // stats: "detailed",
    // infrastructureLogging: {
    //   level: "info",
    // },
    plugins: [
      // Static compile-time variables. Boolean values allow dead-code elimination in production.
      new DefinePlugin({
        isLocalhostSSLEnabled,
      }),
    ],
    ...swcConfig,
    ...(Meteor.isClient && {
      resolve: {
        // Skip resolution for `node:*` built-in modules when building the client
        fallback: {
          path: false,
          util: false,
          "fs/promises": false,
          async_hooks: false,
          stream: false,
          assert: false,
        },
      },
    }),
    module: {
      rules: [
        // Rspack executes loaders right to left (which is bottom up in this file):
        // 1) Transform Sass into CSS using `sass-loader`.
        // 2) Improve CSS browser compatibility with LightningCSS (similar to Autoprefixer).
        // Learn more: https://rspack.rs/guide/features/loader#combining-multiple-loaders
        {
          test: /\.s?css$/i,
          type: "css",
          use: [
            // https://rspack.rs/guide/builtin-loaders/lightningcss-loader
            "builtin:lightningcss-loader",
            {
              loader: "sass-loader",
              options: {
                api: "modern-compiler",
                implementation: require("sass-embedded"),
                sassOptions: {
                  // Silence deprecations in bootstrap that we can not change.
                  quietDeps: true,
                  // Allow deprecated `@import` syntax to keep the existing Sass code as it is.
                  // It will be supported for a long time until Sass 3.0.
                  silenceDeprecations: ["import"],
                },
              },
            },
          ],
        },
        // Include fonts imported into TS/JS modules as assets in the built application.
        {
          test: /\.(woff2?|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
            publicPath: "/__rspack__/",
          },
        },
      ],
    },
  };
});
