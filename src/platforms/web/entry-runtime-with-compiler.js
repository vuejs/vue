/* @flow */

// core 、web 等别名再scripts/alias.js 里定义

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

// qifa 通过id查找到dom
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// qifa 缓存一个mount方法，下面call 调用了
const mount = Vue.prototype.$mount
// 重定义$mount方法，因为这是个带compiler版本，会经历render和compileToFunctions过程
Vue.prototype.$mount = function (
  el?: string | Element, // 元素id 或 dom元素
  hydrating?: boolean
): Component {
  // qifa query方法查询document.querySelector 取到dom对象
  el = el && query(el)

  /* istanbul ignore if */
  // qifa document.body指body, document.documentElement指 html, 不可以挂载到body或html上，因为这是覆盖的
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // qifa 也可以手写render
  /**  template => render, 手写的render 长这样
     Vue.component('anchored-heading', {
      render: function (createElement) {
        return createElement(
          'h' + this.level,   // tag name 标签名称
          this.$slots.default // 子组件中的阵列
        )
      },
      props: {
        level: {
          type: Number,
          required: true
        }
      }
    })
*/
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      // qifa 如果是dom对象，比如div 的nodeType 1
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    // qifa 如果拿到template字符串，就开始编译，后面再跟进去看
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // qifa 跳到 ./runtime/index 里的 $mount方法，注意这个文件是带编译的版本的入口
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
