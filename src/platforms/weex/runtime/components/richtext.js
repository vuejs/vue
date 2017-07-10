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
  return Number(prop.replace(/px$/i, '')) || prop
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
      props.style = vnode.data.staticStyle
      props.attr = vnode.data.attrs

      // TODO: convert inline styles
      if (props.style) {
        for (const key in props.style) {
          props.style[key] = trimCSSUnit(props.style[key])
        }
      }
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
