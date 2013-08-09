# Seed
## 迷你MVVM框架

- gzip后5kb大小
- 基于DOM的动态模版，精确到TextNode的DOM操作
- Model就是原生JS对象，支持任意深度的对象嵌套，不需要繁琐的get()或set()。
- 操作Model时全自动更新DOM
- 管道过滤函数 (filter piping)
- 可自定义绑定函数 (directive) 和过滤函数 (filter)
- 自动抓取计算属性 (computed properties) 的依赖
- 在数组重复的元素上添加listener的时候自动代理事件 (event delegation)
- 基于Component，遵循CommonJS模块标准，也可独立使用
- 移除时自动解绑所有listener