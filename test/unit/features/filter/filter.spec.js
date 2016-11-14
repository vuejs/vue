import Vue from 'vue'
import { parseFilters } from 'compiler/parser/filter-parser'

describe('Filters', () => {
  it('basic usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('HI')
  })

  it('chained usage', () => {
    const vm = new Vue({
      template: '<div>{{ msg | upper | reverse }}</div>',
      data: {
        msg: 'hi'
      },
      filters: {
        upper: v => v.toUpperCase(),
        reverse: v => v.split('').reverse().join('')
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('IH')
  })

  it('in v-bind', () => {
    const vm = new Vue({
      template: `
        <div
          v-bind:id="id | upper | reverse"
          :class="cls | reverse"
          :ref="ref | lower">
        </div>
      `,
      filters: {
        upper: v => v.toUpperCase(),
        reverse: v => v.split('').reverse().join(''),
        lower: v => v.toLowerCase()
      },
      data: {
        id: 'abc',
        cls: 'foo',
        ref: 'BAR'
      }
    }).$mount()
    expect(vm.$el.id).toBe('CBA')
    expect(vm.$el.className).toBe('oof')
    expect(vm.$refs.bar).toBe(vm.$el)
  })

  it('arguments', () => {
    const vm = new Vue({
      template: `<div>{{ msg | add(a, 3) }}</div>`,
      data: {
        msg: 1,
        a: 2
      },
      filters: {
        add: (v, arg1, arg2) => v + arg1 + arg2
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('6')
  })

  it('quotes', () => {
    const vm = new Vue({
      template: `<div>{{ msg + "b | c" + 'd' | upper }}</div>`,
      data: {
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('AB | CD')
  })

  it('double pipe', () => {
    const vm = new Vue({
      template: `<div>{{ b || msg | upper }}</div>`,
      data: {
        b: false,
        msg: 'a'
      },
      filters: {
        upper: v => v.toUpperCase()
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('A')
  })

  it('object literal', () => {
    const vm = new Vue({
      template: `<div>{{ { a: 123 } | pick('a') }}</div>`,
      filters: {
        pick: (v, key) => v[key]
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('123')
  })

  it('array literal', () => {
    const vm = new Vue({
      template: `<div>{{ [1, 2, 3] | reverse }}</div>`,
      filters: {
        reverse: arr => arr.reverse().join(',')
      }
    }).$mount()
    expect(vm.$el.textContent).toBe('3,2,1')
  })

  it('warn non-existent', () => {
    new Vue({
      template: '<div>{{ msg | upper }}</div>',
      data: { msg: 'foo' }
    }).$mount()
    expect('Failed to resolve filter: upper').toHaveBeenWarned()
  })

  it('support template string', () => {
    expect(parseFilters('`a | ${b}c` | d')).toBe('_f("d")(`a | ${b}c`)')
  })
})
