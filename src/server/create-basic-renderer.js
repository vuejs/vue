/* @flow */

import { createRenderFunction } from './render'
import type { RenderOptions } from './create-renderer'

function createWriteFunction (
  write: (text: string, next: Function) => boolean
): Function {
  const cachedWrite = (text, next) => {
    if (text && cachedWrite.caching) {
      cachedWrite.cacheBuffer[cachedWrite.cacheBuffer.length - 1] += text
    }
    write(text, next)
  }
  cachedWrite.caching = false
  cachedWrite.cacheBuffer = []
  cachedWrite.componentBuffer = []
  return cachedWrite
}

export function createBasicRenderer ({
  modules = [],
  directives = {},
  isUnaryTag = (() => false),
  cache
}: RenderOptions = {}) {
  const render = createRenderFunction(modules, directives, isUnaryTag, cache)

  return function renderToString (
    component: Component,
    context: any,
    done: any
  ): void {
    if (typeof context === 'function') {
      done = context
      context = {}
    }
    let result = ''
    const write = createWriteFunction(text => {
      result += text
      return false
    })
    try {
      render(component, write, context, () => {
        done(null, result)
      })
    } catch (e) {
      done(e)
    }
  }
}
