# 当面目录结构功能划分
- vue 源码

- 使用flow 代码类型检查

```txt
  src
    |- compiler      编译相关
    |- core          Vue 核心库
    |- platforms     平台相关代码
    |- server        SSR 服务端渲染
    |- sfc           .vue 文件编译为 .js 文件
    |- shared        公共的代码
```

- compiler 
  - 编译器
  ```txt
    将模板转换成render函数 render创建虚拟DOM 
  ```

- core
  ```txt
    core和平台是无关的
  ```
  - components
    ```txt
      keep-alive 组件
    ```
  - global-api
    ```txt
      vue 的静态方法
    ```
  - instance
    ```txt
      创建vue实例
    ```
  - observer
    ```txt
      响应式实现机制
    ```
  - util
    ```txt
      公共成员
    ```
  - vdom
    ```txt
      虚拟DOM
      增加了组件的机制
    ```
- platforms
  - 平台相关的
    - web 
    - weex
- server
  - 服务端相关代码
- sfc
  - Single file component
    ```txt
      单文件组件
    ```
- shared 
  - 公共的代码

