import { inBrowser } from './env'

export let mark: (tag: string) => void
export let measure: (name: string, startTag: string, endTag: string) => void

if (__DEV__) {
  const perf = inBrowser && window.performance
  /* istanbul ignore if */
  if (
    perf &&
    // @ts-ignore
    perf.mark &&
    // @ts-ignore
    perf.measure &&
    // @ts-ignore
    perf.clearMarks &&
    // @ts-ignore
    perf.clearMeasures
  ) {
    mark = (tag: string) => perf.mark(tag)
    measure = (name: string, startTag: string, endTag: string) => {
      perf.measure(name, startTag, endTag)
      perf.clearMarks(startTag)
      perf.clearMarks(endTag)
      // perf.clearMeasures(name)
    }
  }
}
