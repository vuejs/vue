export function triggerEvent(target, event, process) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (event === 'click') {
    // @ts-expect-error Button is readonly
    ;(e as MouseEvent).button = 0
  }
  if (process) process(e)
  target.dispatchEvent(e)
}
