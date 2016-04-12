export function getAndRemoveAttr (el, attr) {
  let val
  if ((val = el.attrsMap[attr])) {
    el.attrsMap[attr] = null
    for (let i = 0, l = el.attrs.length; i < l; i++) {
      if (el.attrs[i].name === attr) {
        el.attrs.splice(i, 1)
        break
      }
    }
  }
  return val
}

const modifierRE = /\.[^\.]+/g

export function parseModifiers (name) {
  const match = name.match(modifierRE)
  if (match) {
    return match.map(m => m.slice(1))
  }
}

export function removeModifiers (name) {
  return name.replace(modifierRE, '')
}

const tagRE = /\{\{((?:.|\\n)+?)\}\}/g
export function parseText (text) {
  if (!tagRE.test(text)) {
    return null
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    tokens.push('(' + match[1].trim() + ')')
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  return tokens.join('+')
}
