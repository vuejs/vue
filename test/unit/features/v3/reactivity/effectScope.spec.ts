import { nextTick } from 'core/util'
import {
  watch,
  watchEffect,
  reactive,
  computed,
  ref,
  ComputedRef,
  EffectScope,
  onScopeDispose,
  getCurrentScope
} from 'v3/index'
import { effect } from 'v3/reactivity/effect'

describe('reactivity/effectScope', () => {
  it('should run', () => {
    const fnSpy = vi.fn(() => {})
    new EffectScope().run(fnSpy)
    expect(fnSpy).toHaveBeenCalledTimes(1)
  })

  it('should accept zero argument', () => {
    const scope = new EffectScope()
    expect(scope.effects.length).toBe(0)
  })

  it('should return run value', () => {
    expect(new EffectScope().run(() => 1)).toBe(1)
  })

  it('should collect the effects', () => {
    const scope = new EffectScope()
    scope.run(() => {
      let dummy
      const counter = reactive({ num: 0 })
      effect(() => (dummy = counter.num))

      expect(dummy).toBe(0)
      counter.num = 7
      expect(dummy).toBe(7)
    })

    expect(scope.effects.length).toBe(1)
  })

  it('stop', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
      effect(() => (doubled = counter.num * 2))
    })

    expect(scope.effects.length).toBe(2)

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()

    counter.num = 6
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('should collect nested scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
      // nested scope
      new EffectScope().run(() => {
        effect(() => (doubled = counter.num * 2))
      })
    })

    expect(scope.effects.length).toBe(1)
    expect(scope.scopes!.length).toBe(1)
    expect(scope.scopes![0]).toBeInstanceOf(EffectScope)

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    // stop the nested scope as well
    scope.stop()

    counter.num = 6
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('nested scope can be escaped', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
      // nested scope
      new EffectScope(true).run(() => {
        effect(() => (doubled = counter.num * 2))
      })
    })

    expect(scope.effects.length).toBe(1)

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()

    counter.num = 6
    expect(dummy).toBe(7)

    // nested scope should not be stopped
    expect(doubled).toBe(12)
  })

  it('able to run the scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
    })

    expect(scope.effects.length).toBe(1)

    scope.run(() => {
      effect(() => (doubled = counter.num * 2))
    })

    expect(scope.effects.length).toBe(2)

    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()
  })

  it('can not run an inactive scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
    })

    expect(scope.effects.length).toBe(1)

    scope.stop()

    scope.run(() => {
      effect(() => (doubled = counter.num * 2))
    })

    expect('cannot run an inactive effect scope.').toHaveBeenWarned()

    expect(scope.effects.length).toBe(1)

    counter.num = 7
    expect(dummy).toBe(0)
    expect(doubled).toBe(undefined)
  })

  it('should fire onScopeDispose hook', () => {
    let dummy = 0

    const scope = new EffectScope()
    scope.run(() => {
      onScopeDispose(() => (dummy += 1))
      onScopeDispose(() => (dummy += 2))
    })

    scope.run(() => {
      onScopeDispose(() => (dummy += 4))
    })

    expect(dummy).toBe(0)

    scope.stop()
    expect(dummy).toBe(7)
  })

  it('should warn onScopeDispose() is called when there is no active effect scope', () => {
    const spy = vi.fn()
    const scope = new EffectScope()
    scope.run(() => {
      onScopeDispose(spy)
    })

    expect(spy).toHaveBeenCalledTimes(0)

    onScopeDispose(spy)

    expect(
      'onScopeDispose() is called when there is no active effect scope to be associated with.'
    ).toHaveBeenWarned()

    scope.stop()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should dereference child scope from parent scope after stopping child scope (no memleaks)', () => {
    const parent = new EffectScope()
    const child = parent.run(() => new EffectScope())!
    expect(parent.scopes!.includes(child)).toBe(true)
    child.stop()
    expect(parent.scopes!.includes(child)).toBe(false)
  })

  it('test with higher level APIs', async () => {
    const r = ref(1)

    const computedSpy = vi.fn()
    const watchSpy = vi.fn()
    const watchEffectSpy = vi.fn()

    let c: ComputedRef
    const scope = new EffectScope()
    scope.run(() => {
      c = computed(() => {
        computedSpy()
        return r.value + 1
      })

      watch(r, watchSpy)
      watchEffect(() => {
        watchEffectSpy()
        r.value
      })
    })

    c!.value // computed is lazy so trigger collection
    expect(computedSpy).toHaveBeenCalledTimes(1)
    expect(watchSpy).toHaveBeenCalledTimes(0)
    expect(watchEffectSpy).toHaveBeenCalledTimes(1)

    r.value++
    c!.value
    await nextTick()
    expect(computedSpy).toHaveBeenCalledTimes(2)
    expect(watchSpy).toHaveBeenCalledTimes(1)
    expect(watchEffectSpy).toHaveBeenCalledTimes(2)

    scope.stop()

    r.value++
    c!.value
    await nextTick()
    // should not trigger anymore
    expect(computedSpy).toHaveBeenCalledTimes(2)
    expect(watchSpy).toHaveBeenCalledTimes(1)
    expect(watchEffectSpy).toHaveBeenCalledTimes(2)
  })

  it('getCurrentScope() stays valid when running a detached nested EffectScope', () => {
    const parentScope = new EffectScope()

    parentScope.run(() => {
      const currentScope = getCurrentScope()
      expect(currentScope).toBeDefined()
      const detachedScope = new EffectScope(true)
      detachedScope.run(() => {})

      expect(getCurrentScope()).toBe(currentScope)
    })
  })

  it('calling .off() of a detached scope inside an active scope should not break currentScope', () => {
    const parentScope = new EffectScope()

    parentScope.run(() => {
      const childScope = new EffectScope(true)
      childScope.on()
      childScope.off()
      expect(getCurrentScope()).toBe(parentScope)
    })
  })
})
