// eslint.config.mjs
// import { ESLint } from "eslint";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest", // Adjust according to your Node.js version
      sourceType: "script", // Use "script" for require/exports syntax
    },
    rules: {
      "prettier/prettier": "error",
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
    },
    extends: ["eslint:recommended", "prettier"],
  },
];
