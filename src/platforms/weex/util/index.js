/* @flow */
declare var document: Object;

import { makeMap } from 'shared/util'
import { warn } from 'core/util/index'

export const RECYCLE_LIST_MARKER = '@inRecycleList'

export const isReservedTag = makeMap(
  'template,script,style,element,content,slot,link,meta,svg,view,' +
  'a,div,img,image,text,span,input,switch,textarea,spinner,select,' +
  'slider,slider-neighbor,indicator,canvas,' +
  'list,cell,header,loading,loading-indicator,refresh,scrollable,scroller,' +
  'video,web,embed,tabbar,tabheader,datepicker,timepicker,marquee,countdown',
  true
)

// Elements that you can, intentionally, leave open (and which close themselves)
// more flexible than web
export const canBeLeftOpenTag = makeMap(
  'web,spinner,switch,video,textarea,canvas,' +
  'indicator,marquee,countdown',
  true
)

export const isRuntimeComponent = makeMap(
  'richtext,transition,transition-group',
  true
)

export const isUnaryTag = makeMap(
  'embed,img,image,input,link,meta',
  true
)

export function mustUseProp (tag: string, type: ?string, name: string): boolean {
  return false
}

export function getTagNamespace (tag?: string): string | void { }

export function isUnknownElement (tag?: string): boolean {
  return false
}

export function query (el: string | Element, document: Object) {
  // document is injected by weex factory wrapper
  const placeholder = document.createComment('root')
  placeholder.hasAttribute = placeholder.removeAttribute = function () {} // hack for patch
  document.documentElement.appendChild(placeholder)
  return placeholder
}

// Register the component hook to weex native render engine.
// The hook will be triggered by native, not javascript.
export function registerComponentHook (
  componentId: string,
  type: string, // hook type, could be "lifecycle" or "instance"
  hook: string, // hook name
  fn: Function
) {
  if (!document || !document.taskCenter) {
    warn(`Can't find available "document" or "taskCenter".`)
    return
  }
  if (typeof document.taskCenter.registerHook === 'function') {
    return document.taskCenter.registerHook(componentId, type, hook, fn)
  }
  warn(`Failed to register component hook "${type}@${hook}#${componentId}".`)
}

// Updates the state of the component to weex native render engine.
export function updateComponentData (
  componentId: string,
  newData: Object | void,
  callback?: Function
) {
  if (!document || !document.taskCenter) {
    warn(`Can't find available "document" or "taskCenter".`)
    return
  }
  if (typeof document.taskCenter.updateData === 'function') {
    return document.taskCenter.updateData(componentId, newData, callback)
  }
  warn(`Failed to update component data (${componentId}).`)
}
