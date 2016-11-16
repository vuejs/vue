import { makeMap } from 'shared/util'
import renderer from '../runtime/config'

export const isReservedTag = makeMap(
  'div,img,image,input,switch,indicator,list,scroller,cell,template,text,slider,image'
)
export function isUnaryTag () { /* console.log('isUnaryTag') */ }
export function mustUseProp () { /* console.log('mustUseProp') */ }
export function getTagNamespace () { /* console.log('getTagNamespace') */ }
export function isUnknownElement () { /* console.log('isUnknownElement') */ }
export function query (el, document) {
  const placeholder = new renderer.Comment('root')
  placeholder.hasAttribute = placeholder.removeAttribute = function () {} // hack for patch
  document.documentElement.appendChild(placeholder)
  return placeholder
}
