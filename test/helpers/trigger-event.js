window.triggerEvent = function triggerEvent (target, event, process) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  if (event === 'click') {
    e.button = 0
  }
  if (process) process(e)
  target.dispatchEvent(e)
}
