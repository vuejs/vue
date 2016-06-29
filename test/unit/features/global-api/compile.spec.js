import Vue from 'vue'
import { getAndRemoveAttr } from 'compiler/helpers'

describe('Global API: compile', () => {
  it('should compile render functions', () => {
    const { render, staticRenderFns } = Vue.compile('<div><span>{{ msg }}</span></div>')
    const vm = new Vue({
      data: {
        msg: 'hello'
      },
      render,
      staticRenderFns
    }).$mount()
    expect(vm.$el.innerHTML).toContain('<span>hello</span>')
  })

  it('directives / modules options', () => {
    const { render, staticRenderFns } = Vue.compile(`
      <div>
        <input type="text" v-model="msg" required max="8" v-validate:field1.group1.group2>
      </div>
    `, {
      directives: {
        validate (el, dir) {
          if (dir.name === 'validate' && dir.arg) {
            el.validate = {
              field: dir.arg,
              groups: dir.modifiers ? Object.keys(dir.modifiers) : []
            }
          }
        }
      },
      modules: [{
        transformNode (el) {
          el.validators = el.validators || []
          const validators = ['required', 'min', 'max', 'pattern', 'maxlength', 'minlength']
          validators.forEach(name => {
            const rule = getAndRemoveAttr(el, name)
            if (rule !== undefined) {
              el.validators.push({ name, rule })
            }
          })
        },
        genData (el) {
          let data = ''
          if (el.validate) {
            data += `validate:${JSON.stringify(el.validate)},`
          }
          if (el.validators) {
            data += `validators:${JSON.stringify(el.validators)},`
          }
          return data
        },
        transformCode (el, code) {
          // check
          if (!el.validate || !el.validators) {
            return code
          }
          // setup validation result props
          const result = { dirty: false } // define something other prop
          el.validators.forEach(validator => {
            result[validator.name] = null
          })
          // generate code
          return `_h('validate',{props:{
            field:${JSON.stringify(el.validate.field)},
            groups:${JSON.stringify(el.validate.groups)},
            validators:${JSON.stringify(el.validators)},
            result:${JSON.stringify(result)},
            child:${code}}
          })`
        }
      }]
    })
    const vm = new Vue({
      data: {
        msg: 'hello'
      },
      components: {
        validate: {
          props: ['field', 'groups', 'validators', 'result', 'child'],
          render (h) {
            return this.child
          },
          computed: {
            valid () {
              let ret = true
              for (let i = 0; i > this.validators.length; i++) {
                const { name } = this.validators[i]
                if (!this.result[name]) {
                  ret = false
                  break
                }
              }
              return ret
            }
          },
          mounted () {
            // initialize validation
            const value = this.$el.value
            this.validators.forEach(validator => {
              const ret = this[validator.name](value, validator.rule)
              this.result[validator.name] = ret
            })
          },
          methods: {
            // something validators logic
            required (val) {
              return val.length > 0
            },
            max (val, rule) {
              return !(parseInt(val, 10) > parseInt(rule, 10))
            }
          }
        }
      },
      render,
      staticRenderFns
    }).$mount()
    expect(vm.$el.innerHTML).toBe('<input type="text">')
    expect(vm.$children[0].valid).toBe(true)
  })
})
