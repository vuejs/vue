module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",

  parserOptions: {
    // parser: "@typescript-eslint/parser",
    // ecmaVersion: 2018,
    sourceType: "module",
  },
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  // plugins: ["flowtype"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
  ],
  globals: {
    __WEEX__: true,
    WXEnvironment: true,
  },
  rules: {
    "no-console": process.env.NODE_ENV !== "production" ? 0 : 2,
    "no-useless-escape": 0,
    "no-empty": 0,
  },
};
