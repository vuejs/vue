/* globals renderer */

import { makeMap } from 'shared/util'

export const isReservedTag = makeMap(
  'div,img,image,input,switch,indicator,list,scroller,cell,template,text,slider,image'
)

export function isUnaryTag () { /* console.log('isUnaryTag') */ }
export function mustUseProp () { /* console.log('mustUseProp') */ }
export function getTagNamespace () { /* console.log('getTagNamespace') */ }
export function isUnknownElement () { /* console.log('isUnknownElement') */ }

export function query (el, document) {
  // renderer is injected by weex factory wrapper
  const placeholder = new renderer.Comment('root')
  placeholder.hasAttribute = placeholder.removeAttribute = function () {} // hack for patch
  document.documentElement.appendChild(placeholder)
  return placeholder
}
