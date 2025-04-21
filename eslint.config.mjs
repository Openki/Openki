// @ts-check

import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  react.configs.flat.recommended,
  reactHooks.configs["recommended-latest"],

  // Global ignores
  {
    ignores: [
      ".meteor/",
      "node_modules/",
      "packages/",
      "i18next-parser.config.js",
      "postcsss.config.js",
    ],
  },

  // Global language options
  {
    languageOptions: {
      globals: {
        L: "readonly",
        VERSION: "writable",
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Global rules
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/unified-signatures": [
        "error",
        { ignoreDifferentlyNamedParameters: true, ignoreOverloadsWithDifferentJSDoc: true },
      ],
    },
  },

  // Specific override for test files
  {
    files: ["**/*.test.ts", "**/*.app-test.ts"],
    rules: {
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
