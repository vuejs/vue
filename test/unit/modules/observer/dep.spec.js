import Dep from 'core/observer/dep'

describe('Dep', () => {
  let dep

  beforeEach(() => {
    dep = new Dep()
  })

  describe('instance', () => {
    it('should be created with correct properties', () => {
      expect(dep.subs.size).toBe(0)
      expect(new Dep().id).toBe(dep.id + 1)
    })
  })

  describe('addSub()', () => {
    it('should add sub', () => {
      dep.addSub(null)
      expect(dep.subs.size).toBe(1)
      expect(dep.subs.values().next().value).toBe(null)
    })
  })

  describe('removeSub()', () => {
    it('should remove sub', () => {
      dep.subs.add(null)
      dep.removeSub(null)
      expect(dep.subs.size).toBe(0)
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
      dep.subs.add(jasmine.createSpyObj('SUB', ['update']))
      dep.notify()
      expect(dep.subs.values().next().value.update).toHaveBeenCalled()
    })
  })
})
