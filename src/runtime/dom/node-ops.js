export const svgNS = 'http://www.w3.org/2000/svg'

export function createElement (tagName) {
  return document.createElement(tagName)
}

export function createSVGElement (tagName) {
  return document.createElementNS(svgNS, tagName)
}

export function createTextNode (text) {
  return document.createTextNode(text)
}

export function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

export function removeChild (node, child) {
  node.removeChild(child)
}

export function appendChild (node, child) {
  node.appendChild(child)
}

export function parentNode (node) {
  return node.parentElement
}

export function nextSibling (node) {
  return node.nextSibling
}

export function tagName (node) {
  return node.tagName
}

export function setTextContent (node, text) {
  node.textContent = text
}
