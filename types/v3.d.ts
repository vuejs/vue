import { VNode } from './vnode'
import { CreateElement, Vue } from './vue'

export interface SetupContext {
  attrs: Record<string, any>
  slots: Record<string, (() => VNode[]) | undefined>
  emit: (event: string, ...args: any[]) => any
  expose: (exposed?: Record<string, any>) => void
}

export function getCurrentInstance(): { proxy: Vue } | null

export const h: CreateElement
