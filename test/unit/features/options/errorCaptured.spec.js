import Vue from 'vue'

describe('Options errorCaptured', () => {
  let globalSpy

  beforeEach(() => {
    globalSpy = Vue.config.errorHandler = jasmine.createSpy()
  })

  afterEach(() => {
    Vue.config.errorHandler = null
  })

  it('should capture error from child component', () => {
    const spy = jasmine.createSpy()

    let child
    let err
    const Child = {
      created () {
        child = this
        err = new Error('child')
        throw err
      },
      render () {}
    }

    new Vue({
      errorCaptured: spy,
      render: h => h(Child)
    }).$mount()

    expect(spy).toHaveBeenCalledWith(err, child, 'created hook')
    // should not propagate by default
    expect(globalSpy).not.toHaveBeenCalled()
  })

  it('should be able to render the error in itself', done => {
    let child
    const Child = {
      created () {
        child = this
        throw new Error('error from child')
      },
      render () {}
    }

    const vm = new Vue({
      data: {
        error: null
      },
      errorCaptured (e, vm, info) {
        expect(vm).toBe(child)
        this.error = e.toString() + ' in ' + info
      },
      render (h) {
        if (this.error) {
          return h('pre', this.error)
        }
        return h(Child)
      }
    }).$mount()

    waitForUpdate(() => {
      expect(vm.$el.textContent).toContain('error from child')
      expect(vm.$el.textContent).toContain('in created hook')
    }).then(done)
  })

  it('should propagate to global handler when returning true', () => {
    const spy = jasmine.createSpy()

    let child
    let err
    const Child = {
      created () {
        child = this
        err = new Error('child')
        throw err
      },
      render () {}
    }

    new Vue({
      errorCaptured (err, vm, info) {
        spy(err, vm, info)
        return true
      },
      render: h => h(Child, {})
    }).$mount()

    expect(spy).toHaveBeenCalledWith(err, child, 'created hook')
    // should propagate
    expect(globalSpy).toHaveBeenCalledWith(err, child, 'created hook')
  })

  it('should propagate to global handler if itself throws error', () => {
    let child
    let err
    const Child = {
      created () {
        child = this
        err = new Error('child')
        throw err
      },
      render () {}
    }

    let err2
    const vm = new Vue({
      errorCaptured () {
        err2 = new Error('foo')
        throw err2
      },
      render: h => h(Child, {})
    }).$mount()

    expect(globalSpy).toHaveBeenCalledWith(err, child, 'created hook')
    expect(globalSpy).toHaveBeenCalledWith(err2, vm, 'errorCaptured hook')
  })
})
