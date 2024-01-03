import Dep, { cleanupDeps } from 'core/observer/dep'

describe('Dep', () => {
  let dep

  beforeEach(() => {
    dep = new Dep()
  })

  describe('instance', () => {
    it('should be created with correct properties', () => {
      expect(dep.subs.length).toBe(0)
      expect(new Dep().id).toBe(dep.id + 1)
    })
  })

  describe('addSub()', () => {
    it('should add sub', () => {
      dep.addSub(null)
      expect(dep.subs.length).toBe(1)
      expect(dep.subs[0]).toBe(null)
    })
  })

  describe('removeSub()', () => {
    it('should remove sub', () => {
      const sub = {}
      dep.subs.push(sub)
      dep.removeSub(sub)
      expect(dep.subs.includes(sub)).toBe(false)

      // nulled subs are cleared on next flush
      cleanupDeps()
      expect(dep.subs.length).toBe(0)
    })
  })

  describe('depend()', () => {
    let _target

    beforeAll(() => {
      _target = Dep.target
    })

    afterAll(() => {
      Dep.target = _target
    })

    it('should do nothing if no target', () => {
      Dep.target = null
      dep.depend()
    })

    it('should add itself to target', () => {
      Dep.target = { addDep: vi.fn() } as any
      dep.depend()
      expect(Dep.target!.addDep).toHaveBeenCalledWith(dep)
    })
  })

  describe('notify()', () => {
    it('should notify subs', () => {
      dep.subs.push({ update: vi.fn() })
      dep.notify()
      expect(dep.subs[0].update).toHaveBeenCalled()
    })
  })
})
