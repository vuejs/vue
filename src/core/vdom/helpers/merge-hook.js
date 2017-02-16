/* @flow */

export function mergeVNodeHook (def: Object, hookKey: string, hook: Function, key: string) {
  key = key + hookKey
  const injectedHash: Object = def.__injected || (def.__injected = {})
  if (!injectedHash[key]) {
    injectedHash[key] = true
    const oldHook: ?Function = def[hookKey]
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
