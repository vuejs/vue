import { watchPostEffect } from '../'
import { inBrowser, warn } from 'core/util'
import { currentInstance } from '../currentInstance'

/**
 * Runtime helper for SFC's CSS variable injection feature.
 * @private
 */
export function useCssVars(
  getter: (
    vm: Record<string, any>,
    setupProxy: Record<string, any>
  ) => Record<string, string>
) {
  if (!inBrowser && !__TEST__) return

  const instance = currentInstance
  if (!instance) {
    __DEV__ &&
      warn(`useCssVars is called without current active component instance.`)
    return
  }

  watchPostEffect(() => {
    const el = instance.$el
    const vars = getter(instance, instance._setupProxy!)
    if (el && el.nodeType === 1) {
      const style = (el as HTMLElement).style
      for (const key in vars) {
        style.setProperty(`--${key}`, vars[key])
      }
    }
  })
}
