/** @type {import('eslint').Linter.Config} */
export default {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  settings: {
    react: { version: "detect" }
  },
  env: { browser: true, es2021: true, node: true },
  ignorePatterns: ["dist/**", "node_modules/**"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "ignoreRestSiblings": true }]
  }
};
