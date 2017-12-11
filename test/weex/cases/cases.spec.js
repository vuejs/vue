import {
  readFile,
  readObject,
  compileVue,
  compileWithDeps,
  createInstance,
  addTaskHook,
  resetTaskHook,
  getRoot,
  getEvents,
  fireEvent
} from '../helpers'

// Create one-off render test case
function createRenderTestCase (name) {
  const source = readFile(`${name}.vue`)
  const target = readObject(`${name}.vdom.js`)
  return done => {
    compileVue(source).then(code => {
      const id = String(Date.now() * Math.random())
      const instance = createInstance(id, code)
      setTimeout(() => {
        expect(getRoot(instance)).toEqual(target)
        instance.$destroy()
        done()
      }, 50)
    }).catch(done.fail)
  }
}

// Create event test case, will trigger the first bind event
function createEventTestCase (name) {
  const source = readFile(`${name}.vue`)
  const before = readObject(`${name}.before.vdom.js`)
  const after = readObject(`${name}.after.vdom.js`)
  return done => {
    compileVue(source).then(code => {
      const id = String(Date.now() * Math.random())
      const instance = createInstance(id, code)
      setTimeout(() => {
        expect(getRoot(instance)).toEqual(before)
        const event = getEvents(instance)[0]
        fireEvent(instance, event.ref, event.type, {})
        setTimeout(() => {
          expect(getRoot(instance)).toEqual(after)
          instance.$destroy()
          done()
        }, 50)
      }, 50)
    }).catch(done.fail)
  }
}

describe('Usage', () => {
  describe('render', () => {
    it('sample', createRenderTestCase('render/sample'))
  })

  describe('event', () => {
    it('click', createEventTestCase('event/click'))
  })

  describe('recycle-list', () => {
    it('text node', createRenderTestCase('recycle-list/text-node'))
    it('attributes', createRenderTestCase('recycle-list/attrs'))
    // it('class name', createRenderTestCase('recycle-list/classname'))
    // it('inline style', createRenderTestCase('recycle-list/inline-style'))
    it('v-if', createRenderTestCase('recycle-list/v-if'))
    it('v-else', createRenderTestCase('recycle-list/v-else'))
    it('v-else-if', createRenderTestCase('recycle-list/v-else-if'))
    it('v-for', createRenderTestCase('recycle-list/v-for'))
    it('v-for-iterator', createRenderTestCase('recycle-list/v-for-iterator'))
    it('v-on', createRenderTestCase('recycle-list/v-on'))
    it('v-on-inline', createRenderTestCase('recycle-list/v-on-inline'))

    it('stateless component', done => {
      compileWithDeps('recycle-list/components/stateless.vue', [{
        name: 'banner',
        path: 'recycle-list/components/banner.vue'
      }]).then(code => {
        const id = String(Date.now() * Math.random())
        const instance = createInstance(id, code)
        setTimeout(() => {
          const target = readObject('recycle-list/components/stateless.vdom.js')
          expect(getRoot(instance)).toEqual(target)
          instance.$destroy()
          done()
        }, 50)
      }).catch(done.fail)
    })

    it('stateless component with props', done => {
      compileWithDeps('recycle-list/components/stateless-with-props.vue', [{
        name: 'poster',
        path: 'recycle-list/components/poster.vue'
      }]).then(code => {
        const id = String(Date.now() * Math.random())
        const instance = createInstance(id, code)
        setTimeout(() => {
          const target = readObject('recycle-list/components/stateless-with-props.vdom.js')
          expect(getRoot(instance)).toEqual(target)
          instance.$destroy()
          done()
        }, 50)
      }).catch(done.fail)
    })

    it('multi stateless components', done => {
      compileWithDeps('recycle-list/components/stateless-multi-components.vue', [{
        name: 'banner',
        path: 'recycle-list/components/banner.vue'
      }, {
        name: 'poster',
        path: 'recycle-list/components/poster.vue'
      }, {
        name: 'footer',
        path: 'recycle-list/components/footer.vue'
      }]).then(code => {
        const id = String(Date.now() * Math.random())
        const instance = createInstance(id, code)
        setTimeout(() => {
          const target = readObject('recycle-list/components/stateless-multi-components.vdom.js')
          expect(getRoot(instance)).toEqual(target)
          instance.$destroy()
          done()
        }, 50)
      }).catch(done.fail)
    })

    it('stateful component', done => {
      const tasks = []
      addTaskHook((_, task) => tasks.push(task))
      compileWithDeps('recycle-list/components/stateful.vue', [{
        name: 'counter',
        path: 'recycle-list/components/counter.vue'
      }]).then(code => {
        const id = String(Date.now() * Math.random())
        const instance = createInstance(id, code)
        expect(tasks.length).toEqual(3)
        tasks.length = 0
        instance.$triggerHook(2, 'create', ['component-1'])
        instance.$triggerHook(2, 'create', ['component-2'])
        instance.$triggerHook('component-1', 'attach')
        instance.$triggerHook('component-2', 'attach')
        expect(tasks.length).toEqual(2)
        expect(tasks[0].method).toEqual('updateComponentData')
        // expect(tasks[0].args).toEqual([{ count: 42 }])
        expect(tasks[1].method).toEqual('updateComponentData')
        // expect(tasks[1].args).toEqual([{ count: 42 }])
        setTimeout(() => {
          const target = readObject('recycle-list/components/stateful.vdom.js')
          expect(getRoot(instance)).toEqual(target)
          const event = getEvents(instance)[0]
          tasks.length = 0
          fireEvent(instance, event.ref, event.type, {})
          setTimeout(() => {
            // expect(tasks.length).toEqual(1)
            // expect(tasks[0]).toEqual({
            //   module: 'dom',
            //   method: 'updateComponentData',
            //   args: [{ count: 43 }]
            // })
            instance.$destroy()
            resetTaskHook()
            done()
          })
        }, 50)
      }).catch(done.fail)
    })

    it('stateful component with v-model', done => {
      compileWithDeps('recycle-list/components/stateful-v-model.vue', [{
        name: 'editor',
        path: 'recycle-list/components/editor.vue'
      }]).then(code => {
        const id = String(Date.now() * Math.random())
        const instance = createInstance(id, code)
        setTimeout(() => {
          const target = readObject('recycle-list/components/stateful-v-model.vdom.js')
          expect(getRoot(instance)).toEqual(target)
          instance.$destroy()
          done()
        }, 50)
      }).catch(done.fail)
    })
  })
})
