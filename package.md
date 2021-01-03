# rollup
- 适用于打包自己开发的库
- 参数
  ```json
    "scripts": {
      "//": "/* watch 是否检测开启文件监测 */",
      "//": "/* /c 是设置配置文件 后面的配置文件的目录 */",
      "//": "/* 设置环境变量 */",
      "dev": "rollup -w  -c scripts/config.js --sourcemap --environment TARGET:web-full-dev",
    "dev:cjs": "rollup -w -c scripts/config.js --environment TARGET:web-runtime-cjs-dev",
    "//": "build 打包所有版本的js",
    "build": "node scripts/build.js",
  },
  ```