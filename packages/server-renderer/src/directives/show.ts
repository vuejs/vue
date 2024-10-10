import type { VNodeDirective, VNodeWithData } from 'types/vnode'

export default function show(node: VNodeWithData, dir: VNodeDirective) {
  if (!dir.value) {
    const style: any = node.data.style || (node.data.style = {})
    if (Array.isArray(style)) {
      style.push({ display: dir?.modifiers?.important ? 'none !important' : 'none' })
    } else {
      style.display = dir?.modifiers?.important ? 'none !important' : 'none'
    }
  }
}
