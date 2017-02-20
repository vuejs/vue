import { inBrowser } from './env'

export let perf

if (process.env.NODE_ENV !== 'production') {
  perf = inBrowser && window.performance
  if (perf && (!perf.mark || !perf.measure)) {
    perf = undefined
  }
}
