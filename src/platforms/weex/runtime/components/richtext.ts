/* @flow */

import VNode from 'core/vdom/vnode'

function getVNodeType(vnode: VNode): string {
  if (!vnode.tag) {
    return ''
  }
  return vnode.tag.replace(/vue\-component\-(\d+\-)?/, '')
}

function isSimpleSpan(vnode: VNode): boolean {
  return (vnode.children &&
    vnode.children.length === 1 &&
    !vnode.children[0].tag) as any
}

function parseStyle(vnode: VNode): Object | void {
  if (!vnode || !vnode.data) {
    return
  }
  const { staticStyle, staticClass } = vnode.data
  if (vnode.data.style || vnode.data.class || staticStyle || staticClass) {
    const styles = Object.assign({}, staticStyle, vnode.data.style)
    // @ts-expect-error
    const cssMap = vnode.context!.$options.style || {}
    const classList = ([] as string[]).concat(staticClass!, vnode.data.class)
    classList.forEach((name) => {
      if (name && cssMap[name]) {
        Object.assign(styles, cssMap[name])
      }
    })
    return styles
  }
}

function convertVNodeChildren(
  children: Array<VNode>
): Array<VNode> | undefined {
  if (!children.length) {
    return
  }

  return children.map(
    (vnode): VNode => {
      const type: string = getVNodeType(vnode)
      const props: any = { type }

      // convert raw text node
      if (!type) {
        props.type = 'span'
        props.attr = {
          value: (vnode.text || '').trim(),
        }
      } else {
        props.style = parseStyle(vnode)
        if (vnode.data) {
          props.attr = vnode.data.attrs
          if (vnode.data.on) {
            props.events = vnode.data.on
          }
        }
        if (type === 'span' && isSimpleSpan(vnode)) {
          props.attr = props.attr || {}
          //@ts-expect-error
          props.attr.value = vnode.children[0].text.trim()
          return props
        }
      }

      if (vnode.children && vnode.children.length) {
        props.children = convertVNodeChildren(vnode.children)
      }

      return props
    }
  )
}

export default {
  name: 'richtext',
  render(h: Function) {
    return h('weex:richtext', {
      on: this._events,
      attrs: {
        value: convertVNodeChildren(this.$options._renderChildren || []),
      },
    })
  },
}
