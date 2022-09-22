# 虚拟DOM

## 1. 问题
- 为什么vue2.0引入虚拟DOM？
- 引入虚拟dom，渲染变快了吗？
- 什么是虚拟DOM？

## 2. 虚拟DOM
- 当应用状态改变了，只更新这个状态相关联的DOM节点的方案有哪些？
  - `Angular`中使用的脏检查；
  - `React`使用虚拟DOM；
  - `Vue`1.0通过细粒度的绑定；

> 虚拟DOM本质上是将状态映射成视图的众多解决方案中的一种，通过状态生成虚拟节点树，然后使用虚拟节点树进行渲染，在渲染之前，会使用新生成的虚拟节点树和上一次生成的虚拟节点树作对比，只渲染不同的部分。

- `React`和`Angular`都不知道那些状态变了，`Vue`知道哪些状态变化了；
  - `react`使用虚拟DOM比对；
  - `Angular`使用脏检查；
  - `Vue`1.0使用细粒度绑定，使用状态的节点越多，内存消耗就越大，不适用大型项目；
  - `Vue`2.0使用中等粒度绑定并引入了虚拟DOM，即组件为一个`watcher`实例，是一个比较折中的方案；

  > 模板 => 渲染函数 => 虚拟DOM(vnode => patch => 视图)

- 虚拟DOM主要做了两件事：
  - 提供与真实DOM节点对应的虚拟节点`vnode`；
  - 将虚拟节点`vnode`和旧虚拟节点`oldVnode`进行对比，然后更新视图；

## 3. VNode
> 用`JavaScript`对象来描述一个真实的DOM元素。

`vnode`的主要作用：可以进行缓存，当前新创建的`vnode`和上一次缓存的`vnode`进行对比，只更新发生变化的节点。

- `vnode`的类型有：
  - 注释节点（`isComment = true`）；
  - 文本节点（`text`）；
  - 克隆节点（`isCloned = true`）（优化静态节点和插槽节点）；
  - 元素节点（`tag`、`data`、`children`、`context`）；
  - 组件节点（`componentOptions`、`componentInstance`）；
  - 函数式组件（`functionalContext`、`functionalOptions`）；

## 4. patch
> 比较新老节点的差异，从而更新新的结点。

- 创建新增的节点；
  - 新节点与旧节点不相同；
  - 没有旧节点，通常发生在首次渲染；
- 删除已经废弃的节点；
  - 节点在旧节点存在，在新节点不存在；
- 修改需要更新的节点；
  - 新旧节点是同一个节点，更新旧节点；

### 4.1 新增节点
- 新增元素节点；
- 新增注释节点；
- 新增文本节点；

### 4.2 删除节点
- 递归删除节点；

### 4.3 修改节点
静态节点：一旦渲染到界面上后，无论状态如何变化，都不会发生任何变化的节点。

- 新旧节点是静态节点，跳过更新节点过程；
- 新虚拟节点有文本属性，更新DOM的内容为`vnode`的文字；
- 新虚拟节点无文本属性
  - 有`children`情况
    - 新节点有`children`，旧节点无`children`
    - 新旧节点都有`children`，执行新旧节点更新
  - 无`children`情况

### 4.4 更新子节点
- 创建子节点，插入到未处理节点的前面；
- 更新子节点（参考更新新旧节点）
- 移动子节点，移动到未处理节点的前面；
- 删除子节点，`oldChildren`剩余的节点；

### 4.5 优化策略（四指针）
快速查找节点
- 旧前与新前，只需要更新节点；
- 旧后与新后，只需要更新节点；
- 旧前与新后，更新节点或移动位置（移动到未处理节点的最后面）；
- 旧后与新前，更新节点或移动位置（移动到未处理节点的最前面）；
- 循环`oldChildren`查找；
- `newChildren`有剩余节点（`newStartIdx`~`newEndIdx`），插入到DOM；
- `oldChildren`有剩余节点（`oldStartIdx`~`oldEndIdx`），删除这些节点；




### 4.6 知识点
- `Document.createElementNS()`创建一个具有指定的命名空间URI和限定名称的元素

### 4.7 更新新旧节点
![更新新旧节点.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c92d09fcf8dc440881bc8738180d0f37~tplv-k3u1fbpfcp-watermark.image)

### 4.8 更新子节点
![更新子节点.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cbe79c361a9a49fdb5d57de9cac2de4d~tplv-k3u1fbpfcp-watermark.image)