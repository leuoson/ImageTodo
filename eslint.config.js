import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";

const require = createRequire(import.meta.url);
const { FlatCompat } = require("@eslint/eslintrc");

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));
const compat = new FlatCompat({
  baseDirectory: tsconfigRootDir,
});

const tsRecommended = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      projectService: true,
      tsconfigRootDir,
    },
  },
}));

export default [
  {
    ignores: ["dist", "node_modules", "coverage", "src-tauri/target", "src-tauri/gen"],
  },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  ...compat.extends(
    "plugin:jsx-a11y/recommended",
    "plugin:testing-library/react",
    "plugin:jest-dom/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ),
  ...tsRecommended,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
    },
    plugins: {
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/exhaustive-deps": "warn",
      "import/order": "off",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/**/*.{spec,test}.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    rules: {
      "testing-library/no-node-access": "off",
    },
  },
  {
    files: ["**/*.config.{js,cjs,mjs,ts}"],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
];
