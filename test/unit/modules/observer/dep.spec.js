import Dep from 'core/observer/dep'

describe('Dep', () => {
  let dep

  beforeEach(() => {
    dep = new Dep()
  })

  function subsLength (dep) {
    return Object.keys(dep.subs).length
  }

  describe('instance', () => {
    it('should be created with correct properties', () => {
      expect(subsLength(dep)).toBe(0)
      expect(new Dep().id).toBe(dep.id + 1)
    })
  })

  describe('addSub()', () => {
    it('should add sub', () => {
      const dummySub = { id: 1 }
      dep.addSub(dummySub)
      expect(subsLength(dep)).toBe(1)
      expect(dep.subs[dummySub.id]).toBe(dummySub)
    })
  })

  describe('removeSub()', () => {
    it('should remove sub', () => {
      const dummySub = { id: 1 }
      dep.subs[dummySub.id] = dummySub
      dep.removeSub(dummySub)
      expect(subsLength(dep)).toBe(0)
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
      Dep.target = jasmine.createSpyObj('TARGET', ['addDep'])
      dep.depend()
      expect(Dep.target.addDep).toHaveBeenCalledWith(dep)
    })
  })

  describe('notify()', () => {
    it('should notify subs', () => {
      const subId = 1
      dep.subs[subId] = jasmine.createSpyObj('SUB', ['update'])
      dep.notify()
      expect(dep.subs[subId].update).toHaveBeenCalled()
    })
  })
})
