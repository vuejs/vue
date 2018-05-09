import Dep from 'core/observer/dep'

describe('Dep', () => {
  let dep

  beforeEach(() => {
    dep = new Dep()
  })

  describe('instance', () => {
    it('should be created with correct properties', () => {
      expect(Object.keys(dep.subs).length).toBe(0)
      expect(new Dep().id).toBe(dep.id + 1)
    })
  })

  describe('addSub()', () => {
    it('should add sub', () => {
      dep.addSub({ id: 123 })
      console.log(dep)
      expect(dep.subs).toEqual({ 123: { id: 123 }})
    })
  })

  describe('removeSub()', () => {
    it('should remove sub', () => {
      dep[123] = { id: 123 }
      dep.removeSub({ id: 123 })
      expect(Object.keys(dep.subs).length).toBe(0)
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
      dep.subs[123] = { id: 123, update: jasmine.createSpy('update') }
      dep.notify()
      expect(dep.subs[123].update).toHaveBeenCalled()
    })
  })
})
