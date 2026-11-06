import VNode from 'core/vdom/vnode'
import { Component } from './component'

export type ComponentWithCacheContext = {
  type: 'ComponentWithCache'
  bufferIndex: number
  buffer: Array<string>
  key: string
}

export type ElementContext = {
  type: 'Element'
  children: Array<VNode>
  rendered: number
  endTag: string
  total: number
}

export type ComponentContext = {
  type: 'Component'
  prevActive: Component
}

export type RenderState =
  | ComponentContext
  | ComponentWithCacheContext
  | ElementContext
