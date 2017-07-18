function getVNodeType (vnode) {
  const tagName = vnode.tag
  if (!tagName) {
    return ''
  }
  return tagName.replace(/vue\-component\-(\d+\-)?/, '')
}

function isSimpleSpan (vnode) {
  return vnode.children && vnode.children.length === 1 && !vnode.children[0].tag
}

function trimCSSUnit (prop) {
  return Number(String(prop).replace(/px$/i, '')) || prop
}

function parseStyle (vnode) {
  const { staticStyle, staticClass } = vnode.data
  if (vnode.data.style || vnode.data.class || staticStyle || staticClass) {
    const styles = Object.assign({}, staticStyle, vnode.data.style)

    // TODO: more reliable
    const cssMap = vnode.context.$options.style
    const classList = [].concat(staticClass, vnode.data.class)
    classList.forEach(name => {
      if (name && cssMap[name]) {
        Object.assign(styles, cssMap[name])
      }
    })

    for (const key in styles) {
      styles[key] = trimCSSUnit(styles[key])
    }
    return styles
  }
}

function convertVNodeChildren (children) {
  if (!children.length) {
    return
  }
  return children.map(vnode => {
    const type = getVNodeType(vnode)
    const props = { type }

    // convert raw text node
    if (!type) {
      props.type = 'span'
      props.attr = {
        value: (vnode.text || '').trim()
      }
    }

    if (vnode.data) {
      props.style = parseStyle(vnode)
      props.attr = vnode.data.attrs
    }

    if (type === 'span' && isSimpleSpan(vnode)) {
      props.attr = props.attr || {}
      props.attr.value = vnode.children[0].text.trim()
      return props
    }

    if (vnode.children && vnode.children.length) {
      props.children = convertVNodeChildren(vnode.children)
    }

    return props
  })
}

export default {
  name: 'richtext',
  abstract: true,
  render (h) {
    return h('weex:richtext', {
      attrs: {
        value: convertVNodeChildren(this.$options._renderChildren || [])
      }
    })
  }
}
