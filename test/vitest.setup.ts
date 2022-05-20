;(global as any).__SSR_TEST__ = false

process.env.NEW_SLOT_SYNTAX = 'true'

import './helpers/shim-done'
import './helpers/to-have-warned'
import './helpers/wait-for-update'
import './helpers/trigger-event'
import './helpers/vdom'
import './helpers/classlist'
