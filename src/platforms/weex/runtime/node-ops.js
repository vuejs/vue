/* globals renderer */
// renderer is injected by weex factory wrapper

export const namespaceMap = {}

export function createElement (tagName) {
  return new renderer.Element(tagName)
}

export function createElementNS (namespace, tagName) {
  return new renderer.Element(namespace + ':' + tagName)
}

export function createTextNode (text) {
  return new renderer.TextNode(text)
}

export function createComment (text) {
  return new renderer.Comment(text)
}

export function insertBefore (node, target, before) {
  if (target.nodeType === 3) {
    if (node.type === 'text') {
      node.setAttr('value', target.text)
      target.parentNode = node
    } else {
      const text = createElement('text')
      text.setAttr('value', target.text)
      node.insertBefore(text, before)
    }
    return
  }
  node.insertBefore(target, before)
}

export function removeChild (node, child) {
  if (child.nodeType === 3) {
    node.setAttr('value', '')
    return
  }
  node.removeChild(child)
}

export function appendChild (node, child) {
  if (child.nodeType === 3) {
    if (node.type === 'text') {
      node.setAttr('value', child.text)
      child.parentNode = node
    } else {
      const text = createElement('text')
      text.setAttr('value', child.text)
      node.appendChild(text)
    }
    return
  }

  node.appendChild(child)
}

export function parentNode (node) {
  return node.parentNode
}

export function nextSibling (node) {
  return node.nextSibling
}

export function tagName (node) {
  return node.type
}

export function setTextContent (node, text) {
  node.parentNode.setAttr('value', text)
}

export function setAttribute (node, key, val) {
  node.setAttr(key, val)
}
