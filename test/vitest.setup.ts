process.env.NEW_SLOT_SYNTAX = 'true'

import './helpers/shim-done'
import './helpers/to-have-warned'
import './helpers/classlist'

import { waitForUpdate } from './helpers/wait-for-update'
import { triggerEvent } from './helpers/trigger-event'
import { createTextVNode } from './helpers/vdom'

global.waitForUpdate = waitForUpdate
global.triggerEvent = triggerEvent
global.createTextVNode = createTextVNode
