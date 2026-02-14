// Fix for memory leak in issue #13308
import { queueJob } from './scheduler'

let isProcessing = false
const cleanupRegistry = new Set()

export function nextTick(cb?: () => void): Promise<void> {
  if (isProcessing) {
    return Promise.resolve()
  }
  
  return new Promise(resolve => {
    isProcessing = true
    try {
      if (cb) {
        queueJob(() => {
          try {
            cb()
          } finally {
            // Execute all registered cleanup functions
            cleanupRegistry.forEach(cleanup => cleanup())
            cleanupRegistry.clear()
          }
          resolve()
        })
      } else {
        queueJob(resolve)
      }
    } finally {
      isProcessing = false
    }
  })
}

// Register cleanup functions for resource management
export function registerResourceCleanup(cleanup: () => void): void {
  cleanupRegistry.add(cleanup)
}
