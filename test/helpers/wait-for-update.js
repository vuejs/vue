import Vue from 'vue'

// helper for async assertions.
// Use like this:
//
// vm.a = 123
// waitForUpdate(() => {
//   expect(vm.$el.textContent).toBe('123')
//   vm.a = 234
// })
// .then(() => {
//   // more assertions...
//   done()
// })
// .catch(done)
window.waitForUpdate = initialCb => {
  let done
  const queue = initialCb ? [initialCb] : []

  function shift () {
    const job = queue.shift()
    let hasError = false
    try {
      job()
    } catch (e) {
      hasError = true
      if (done) {
        done.fail(e)
      }
    }
    if (!hasError) {
      if (queue.length) {
        Vue.nextTick(shift)
      }
    }
  }

  Vue.nextTick(shift)

  const chainer = {
    then: nextCb => {
      queue.push(nextCb)
      return chainer
    },
    catch: doneCb => {
      done = doneCb
      return chainer
    }
  }

  return chainer
}
