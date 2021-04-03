import { hasSymbol } from './utils'

function createSymbol(name: string): string {
  return hasSymbol ? (Symbol.for(name) as any) : name
}

export const WatcherPreFlushQueueKey = createSymbol(
  'composition-api.preFlushQueue'
)
export const WatcherPostFlushQueueKey = createSymbol(
  'composition-api.postFlushQueue'
)

// must be a string, symbol key is ignored in reactive
export const RefKey = 'composition-api.refKey'
