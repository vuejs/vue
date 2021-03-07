### Vue2 调试方法

##### 安装依赖
```sh
npm i
```

##### 全局安装构建工具
```sh
npm i rollup -g
```

##### 修改根目录下的package.json文件的dev命令
原命令：
```json
"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"
```
添加sourcemap：
```json
"dev": "rollup -w -c scripts/config.js --sourcemap --environment TARGET:web-full-dev"
```

##### 终端运行脚本
```sh
npm run dev
```

##### 调试
根目录下找到 examples/commits文件夹然后找到index.html文件，将其中vue.min.js的引用改成vue.js，也可以在根目录下找到 examples/commits文件夹然后自己新建一个test.html文件，引入dist文件夹下的vue.js，不需要开启本地服务，直接浏览器打开html文件就可以开始断电调试了。
