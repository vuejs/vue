
module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript"
  ],
  plugins: [
    require("babel-plugin-transform-vue-jsx"),
    require("@babel/plugin-syntax-dynamic-import"),
  ],

  ignore: ["dist/*.js", "packages/**/*.js"],
};
