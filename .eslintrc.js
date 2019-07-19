const OFF = 0
const ERROR = 2

module.exports = {
  root: true,
  parserOptions: {
    parser: require.resolve('babel-eslint'),
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  env: {
    es6: true,
    node: true,
    browser: true
  },
  plugins: [
    "flowtype"
  ],
  extends: [
    "eslint:recommended",
    "plugin:flowtype/recommended"
  ],
  globals: {
    "__WEEX__": true,
    "WXEnvironment": true
  },
  rules: {
    'no-console': process.env.NODE_ENV !== 'production' ? OFF : ERROR,
    'no-useless-escape': OFF,
    'no-empty': OFF
  }
}
