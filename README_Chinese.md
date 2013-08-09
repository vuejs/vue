# Seed
## 迷你MVVM框架

- gzip后5kb大小
- 基于DOM的动态模版，精确到TextNode的DOM操作
- 管道过滤函数 (filter piping)
- Model就是原生JS对象，不需要繁琐的get()或set()。操作对象自动更新DOM
- 自动抓取需要计算的属性 (computed properties) 的依赖
- 在数组重复的元素上添加listener的时候自动代理事件 (event delegation)
- 基于Component，遵循CommonJS模块标准，也可独立使用
- 移除时自动解绑所有listener