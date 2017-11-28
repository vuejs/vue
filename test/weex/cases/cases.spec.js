import {
  readFile,
  readObject,
  compileVue,
  compileWithDeps,
  createInstance,
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
          done()
        }, 50)
      }).catch(done.fail)
    })

    // it('stateless component with props', done => {
    //   compileWithDeps('recycle-list/components/stateless-with-props.vue', [{
    //     name: 'poster',
    //     path: 'recycle-list/components/poster.vue'
    //   }]).then(code => {
    //     const id = String(Date.now() * Math.random())
    //     const instance = createInstance(id, code)
    //     setTimeout(() => {
    //       const target = readObject('recycle-list/components/stateless-with-props.vdom.js')
    //       expect(getRoot(instance)).toEqual(target)
    //       done()
    //     }, 50)
    //   }).catch(done.fail)
    // })

    // it('stateful component', done => {
    //   compileWithDeps('recycle-list/components/stateful.vue', [{
    //     name: 'counter',
    //     path: 'recycle-list/components/counter.vue'
    //   }]).then(code => {
    //     const id = String(Date.now() * Math.random())
    //     const instance = createInstance(id, code)
    //     setTimeout(() => {
    //       const target = readObject('recycle-list/components/stateful.vdom.js')
    //       expect(getRoot(instance)).toEqual(target)
    //       const event = getEvents(instance)[0]
    //       fireEvent(instance, event.ref, event.type, {})
    //       setTimeout(() => {
    //         // TODO: check render results
    //         // expect(getRoot(instance)).toEqual(target)
    //         done()
    //       })
    //     }, 50)
    //   }).catch(done.fail)
    // })
  })
})

