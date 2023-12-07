import { DefineComponent } from './v3-define-component'

type Hook<T = () => void> = T | T[]

export interface TransitionProps {
  name?: string
  appear?: boolean
  css?: boolean
  mode?: 'in-out' | 'out-in' | 'default'
  type?: 'transition' | 'animation'

  duration?:
    | number
    | string
    | {
        enter: number
        leave: number
      }

  // classes
  enterClass?: string
  enterActiveClass?: string
  enterToClass?: string
  appearClass?: string
  appearActiveClass?: string
  appearToClass?: string
  leaveClass?: string
  leaveActiveClass?: string
  leaveToClass?: string

  // event hooks
  onBeforeEnter?: Hook<(el: Element) => void>
  onEnter?: Hook<(el: Element, done: () => void) => void>
  onAfterEnter?: Hook<(el: Element) => void>
  onEnterCancelled?: Hook<(el: Element) => void>
  onBeforeLeave?: Hook<(el: Element) => void>
  onLeave?: Hook<(el: Element, done: () => void) => void>
  onAfterLeave?: Hook<(el: Element) => void>
  onLeaveCancelled?: Hook<(el: Element) => void>
  onBeforeAppear?: Hook<(el: Element) => void>
  onAppear?: Hook<(el: Element, done: () => void) => void>
  onAfterAppear?: Hook<(el: Element) => void>
  onAppearCancelled?: Hook<(el: Element) => void>
}

export declare const Transition: DefineComponent<TransitionProps>

export type TransitionGroupProps = Omit<TransitionProps, 'mode'> & {
  tag?: string
  moveClass?: string
}

export declare const TransitionGroup: DefineComponent<TransitionGroupProps>

type MatchPattern = string | RegExp | (string | RegExp)[]

export interface KeepAliveProps {
  include?: MatchPattern
  exclude?: MatchPattern
  max?: number | string
}

export declare const KeepAlive: DefineComponent<KeepAliveProps>
