// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        TextEncoder: "readonly",
        TextDecoder: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
      },
    },
  },
  {
    ignores: ["node_modules/", "coverage/"],
  },
];
