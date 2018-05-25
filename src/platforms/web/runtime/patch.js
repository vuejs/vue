/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)
// 对比 vnode 的方法，生成 DOM 结构的方法，暂不深入研究
export const patch: Function = createPatchFunction({ nodeOps, modules })
