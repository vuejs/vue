import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

const modules = baseModules.concat(platformModules)

export const basePatch: Function = createPatchFunction({ nodeOps, modules })
