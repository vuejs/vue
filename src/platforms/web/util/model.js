/* @flow */

export function getModelModifier (vnode: VNodeWithData): ASTModifiers | void {
  const directives = vnode.data.directives || []
  for (let i = 0, directive; i < directives.length; i++) {
    directive = directives[i]
    if (directive.name === 'model') {
      return directive.modifiers
    }
  }
  return undefined
}

export function isToNumber (modifiers: ?ASTModifiers, type: ?string): boolean {
  return (modifiers && modifiers.number) || type === 'number'
}

export function isToTrim (modifiers: ?ASTModifiers) {
  return modifiers && modifiers.trim
}
