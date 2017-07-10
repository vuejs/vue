function parseChildren (h, options) {
  const children = options._renderChildren
  if (!children) {
    return []
  }

  return children.map(vnode => {
    if (!vnode.tag && vnode.text) {
      return h('span', vnode.text)
    }
    return vnode
  })
}

function getVNodeType (vnode) {
  const tagName = vnode.tag
  if (!tagName) {
    return ''
  }
  return tagName.replace(/vue\-component\-(\d+\-)?/, '')
}

function convertVNodeChildren (children) {
  if (!children.length) {
    return
  }
  return children.map(vnode => {
    const type = getVNodeType(vnode)
    const props = { type }

    // TODO: filter
    if (vnode.data) {
      props.style = vnode.data.staticStyle
      props.attr = vnode.data.attrs
    }

    if (type === 'span') {
      props.attr = {}
      props.attr.value = vnode.text || vnode.children.map(c => c.text).join('').trim()
    }

    return props
  })
}

export default {
  name: 'richtext',
  abstract: true,
  render (h) {
    const children = parseChildren(h, this.$options)
    const values = convertVNodeChildren(children)
    return h('weex:richtext', {
      attrs: {
        value: values
      }
    })
  }
}
