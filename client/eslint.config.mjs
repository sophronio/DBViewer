export default [
  {
    ignores: ["node_modules"],
  },
  {
    files: ["src/**/*.js", "src/**/*.jsx"],
    plugins: {
      react: require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
      prettier: require("eslint-plugin-prettier"),
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "prettier/prettier": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
