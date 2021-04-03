import {
  onBeforeMount,
  onMounted,
  ref,
  h,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  nextTick,
  createApp,
} from '../../../src'

// reference: https://vue-composition-api-rfc.netlify.com/api.html#lifecycle-hooks

describe('api: lifecycle hooks', () => {
  it('onBeforeMount', () => {
    const root = document.createElement('div')
    const fn = jest.fn(() => {
      // should be called before inner div is rendered
      expect(root.innerHTML).toBe(``)
    })

    const Comp = {
      setup() {
        onBeforeMount(fn)
        return () => h('div')
      },
    }
    createApp(Comp).mount(root)
    //render(h(Comp), root);
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onMounted', () => {
    const root = document.createElement('div')
    const fn = jest.fn(() => {
      // should be called after inner div is rendered
      expect(root.outerHTML).toBe(`<div></div>`)
    })

    const Comp = {
      setup() {
        onMounted(fn)
        return () => h('div')
      },
    }
    createApp(Comp).mount(root)
    //render(h(Comp), root);
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onBeforeUpdate', async () => {
    const count = ref(0)
    // const root = document.createElement('div');
    const fn = jest.fn(() => {
      // should be called before inner div is updated
      expect(vm.$el.outerHTML).toBe(`<div>0</div>`)
    })

    const Comp = {
      setup() {
        onBeforeUpdate(fn)
        return () => h('div', (count.value as unknown) as string)
      },
    }
    const vm = createApp(Comp).mount()
    //render(h(Comp), root);

    count.value = 1
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('onUpdated', async () => {
    const count = ref(0)
    // const root = document.createElement('div');
    const fn = jest.fn(() => {
      // should be called after inner div is updated
      expect(vm.$el.outerHTML).toBe(`<div>1</div>`)
    })

    const Comp = {
      setup() {
        onUpdated(fn)
        return () => h('div', (count.value as unknown) as string)
      },
    }
    const vm = createApp(Comp).mount()
    //render(h(Comp), root);

    count.value++
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // it('onBeforeUnmount', async () => {
  //   const toggle = ref(true);
  //   const root = document.createElement('div');
  //   const fn = jest.fn(() => {
  //     // should be called before inner div is removed
  //     expect(root.outerHTML).toBe(`<div></div>`);
  //   });

  //   const Comp = {
  //     setup() {
  //       return () => (toggle.value ? h(Child) : null);
  //     },
  //   };

  //   const Child = {
  //     setup() {
  //       onBeforeUnmount(fn);
  //       return () => h('div');
  //     },
  //   };

  //   createApp(Comp).mount(root);
  //   //render(h(Comp), root);

  //   toggle.value = false;
  //   await nextTick();
  //   expect(fn).toHaveBeenCalledTimes(1);
  // });

  // it('onUnmounted', async () => {
  //   const toggle = ref(true);
  //   const root = document.createElement('div');
  //   const fn = jest.fn(() => {
  //     // should be called after inner div is removed
  //     expect(root.outerHTML).toBe(`<!---->`);
  //   });

  //   const Comp = {
  //     setup() {
  //       return () => (toggle.value ? h(Child) : null);
  //     },
  //   };

  //   const Child = {
  //     setup() {
  //       onUnmounted(fn);
  //       return () => h('div');
  //     },
  //   };

  //   createApp(Comp).mount(root);
  //   //render(h(Comp), root);

  //   toggle.value = false;
  //   await nextTick();
  //   expect(fn).toHaveBeenCalledTimes(1);
  // });

  it('onBeforeUnmount in onMounted', async () => {
    const toggle = ref(true)
    const root = document.createElement('div')
    const fn = jest.fn(() => {
      // should be called before inner div is removed
      expect(root.outerHTML).toBe(`<div></div>`)
    })

    const Comp = {
      setup() {
        return () => (toggle.value ? h(Child) : null)
      },
    }

    const Child = {
      setup() {
        onMounted(() => {
          onBeforeUnmount(fn)
        })
        return () => h('div')
      },
    }

    createApp(Comp).mount(root)
    //render(h(Comp), root);

    toggle.value = false
    await nextTick()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('lifecycle call order', async () => {
    const count = ref(0)
    const calls: string[] = []

    const Root = {
      setup() {
        onBeforeMount(() => calls.push('root onBeforeMount'))
        onMounted(() => calls.push('root onMounted'))
        onBeforeUpdate(() => calls.push('root onBeforeUpdate'))
        onUpdated(() => calls.push('root onUpdated'))
        onBeforeUnmount(() => calls.push('root onBeforeUnmount'))
        onUnmounted(() => calls.push('root onUnmounted'))
        return () => h(Mid, { props: { count: count.value } })
      },
    }
    const Mid = {
      props: {
        count: Number,
      },
      setup(props: any) {
        onBeforeMount(() => calls.push('mid onBeforeMount'))
        onMounted(() => calls.push('mid onMounted'))
        onBeforeUpdate(() => calls.push('mid onBeforeUpdate'))
        onUpdated(() => calls.push('mid onUpdated'))
        onBeforeUnmount(() => calls.push('mid onBeforeUnmount'))
        onUnmounted(() => calls.push('mid onUnmounted'))
        return () => h(Child, { props: { count: props.count } })
      },
    }

    const Child = {
      props: {
        count: Number,
      },
      setup(props: any) {
        onBeforeMount(() => calls.push('child onBeforeMount'))
        onMounted(() => calls.push('child onMounted'))
        onBeforeUpdate(() => calls.push('child onBeforeUpdate'))
        onUpdated(() => calls.push('child onUpdated'))
        onBeforeUnmount(() => calls.push('child onBeforeUnmount'))
        onUnmounted(() => calls.push('child onUnmounted'))
        return () => h('div', props.count)
      },
    }

    // mount
    // render(h(Root), root);
    const vm = createApp(Root)
    vm.mount()
    expect(calls).toEqual([
      'root onBeforeMount',
      'mid onBeforeMount',
      'child onBeforeMount',
      'child onMounted',
      'mid onMounted',
      'root onMounted',
    ])

    calls.length = 0

    // update
    count.value++
    await nextTick()
    await nextTick()
    await nextTick()
    expect(calls).toEqual([
      'root onBeforeUpdate',
      'mid onBeforeUpdate',
      'child onBeforeUpdate',
      'child onUpdated',
      'mid onUpdated',
      'root onUpdated',
    ])

    calls.length = 0

    // unmount
    // render(null, root);
    vm.unmount()
    expect(calls).toEqual([
      'root onBeforeUnmount',
      'mid onBeforeUnmount',
      'child onBeforeUnmount',
      'child onUnmounted',
      'mid onUnmounted',
      'root onUnmounted',
    ])
  })

  // it('onRenderTracked', () => {
  //   const events: DebuggerEvent[] = [];
  //   const onTrack = jest.fn((e: DebuggerEvent) => {
  //     events.push(e);
  //   });
  //   const obj = reactive({ foo: 1, bar: 2 });

  //   const Comp = {
  //     setup() {
  //       onRenderTracked(onTrack);
  //       return () => h('div', [obj.foo, 'bar' in obj, Object.keys(obj).join('')]);
  //     },
  //   };

  //   render(h(Comp), document.createElement('div'));
  //   expect(onTrack).toHaveBeenCalledTimes(3);
  //   expect(events).toMatchObject([
  //     {
  //       target: obj,
  //       type: TrackOpTypes.GET,
  //       key: 'foo',
  //     },
  //     {
  //       target: obj,
  //       type: TrackOpTypes.HAS,
  //       key: 'bar',
  //     },
  //     {
  //       target: obj,
  //       type: TrackOpTypes.ITERATE,
  //       key: ITERATE_KEY,
  //     },
  //   ]);
  // });

  // it('onRenderTriggered', async () => {
  //   const events: DebuggerEvent[] = [];
  //   const onTrigger = jest.fn((e: DebuggerEvent) => {
  //     events.push(e);
  //   });
  //   const obj = reactive({ foo: 1, bar: 2 });

  //   const Comp = {
  //     setup() {
  //       onRenderTriggered(onTrigger);
  //       return () => h('div', [obj.foo, 'bar' in obj, Object.keys(obj).join('')]);
  //     },
  //   };

  //   render(h(Comp), document.createElement('div'));

  //   obj.foo++;
  //   await nextTick();
  //   expect(onTrigger).toHaveBeenCalledTimes(1);
  //   expect(events[0]).toMatchObject({
  //     type: TriggerOpTypes.SET,
  //     key: 'foo',
  //     oldValue: 1,
  //     newValue: 2,
  //   });

  //   delete obj.bar;
  //   await nextTick();
  //   expect(onTrigger).toHaveBeenCalledTimes(2);
  //   expect(events[1]).toMatchObject({
  //     type: TriggerOpTypes.DELETE,
  //     key: 'bar',
  //     oldValue: 2,
  //   });
  //   (obj as any).baz = 3;
  //   await nextTick();
  //   expect(onTrigger).toHaveBeenCalledTimes(3);
  //   expect(events[2]).toMatchObject({
  //     type: TriggerOpTypes.ADD,
  //     key: 'baz',
  //     newValue: 3,
  //   });
  // });
})
