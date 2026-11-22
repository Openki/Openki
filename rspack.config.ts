import { defineConfig } from "@meteorjs/rspack";
import { DefinePlugin } from "@rspack/core";
import { readFileSync } from "node:fs";
import type { ServerOptions } from "node:https";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.filename);

const isLocalhostSSLEnabled = process.env.OPENKI_LOCALHOST_SSL === "1";
const serverOptions: ServerOptions = {};

if (isLocalhostSSLEnabled) {
  try {
    serverOptions.cert = readFileSync(resolve(import.meta.dirname, "localhost.pem"));
    serverOptions.key = readFileSync(resolve(import.meta.dirname, "localhost-key.pem"));
  } catch (error) {
    console.error(error);
    console.warn(
      "Unable to load local SSL configuration. Please generate a local SSL certificate with `just setup-localhost-ssl`",
    );
  }
}

export default defineConfig((Meteor) => ({
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
      __IS_LOCALHOST_SSL_ENABLED__: isLocalhostSSLEnabled,
    }),
  ],
  ...(isLocalhostSSLEnabled
    ? {
        devServer: {
          server: {
            type: "https",
            options: serverOptions,
          },
        },
      }
    : {}),
  ...Meteor.extendSwcConfig({
    jsc: {
      transform: { react: { runtime: "automatic" } },
      // Meteor seems to hard code client code to es2015 which is really bad.
      // We should use modern targets in order
      // https://github.com/meteor/meteor/blob/b377f35db21e0f77971fa982f5603a76c08542d8/npm-packages/meteor-rspack/rspack.config.js#L139
      //
      // Related: It seems like @meteorjs/rspack doesn't read the browserslist config.
      // However, we should get good enough browser support as long as we:
      // 1) Set a modern JS target here.
      // 2) Using `lightningcss` for CSS.
      target: Meteor.isClient ? "es2022" : "es2024",
    },
  }),
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
      // Let Rspack handle regular CSS.
      // LightningCSS is similar to Autoprefixer
      // https://rspack.rs/guide/builtin-loaders/lightningcss-loader
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
                // Allow deprecated `@import` syntax to keep the existing Sass code as it is.
                // It will be supported for a long time until Sass 3.0.
                silenceDeprecations: ["import"],
              },
            },
          },
        ],
        type: "css",
      },
      // Include fonts as assets in the built application
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
}));
