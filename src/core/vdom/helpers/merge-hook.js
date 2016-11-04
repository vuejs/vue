/* @flow */

export function mergeVNodeHook (def: Object, hookKey: string, hook: Function, key: string) {
  key = key + hookKey
  const injectedHash = def.__injected || (def.__injected = {})
  if (!injectedHash[key]) {
    injectedHash[key] = true
    const oldHook = def[hookKey]
    if (oldHook) {
      def[hookKey] = function () {
        oldHook.apply(this, arguments)
        hook.apply(this, arguments)
      }
    } else {
      def[hookKey] = hook
    }
  }
}
