import fs from 'fs'
import path from 'path'
import {
  compileVue,
  createInstance,
  getRoot,
  getEvents,
  fireEvent
} from '../helpers'

function readFile (filename) {
  return fs.readFileSync(path.resolve(__dirname, filename), 'utf8')
}

function readObject (filename) {
  return (new Function(`return ${readFile(filename)}`))()
}

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
    }).catch(err => {
      expect(err).toBe(null)
      done()
    })
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
    }).catch(err => {
      expect(err).toBe(null)
      done()
    })
  }
}

describe('Usage', () => {
  describe('render', () => {
    it('sample', createRenderTestCase('render/sample'))
  })

  describe('event', () => {
    it('click', createEventTestCase('event/click'))
  })
})

