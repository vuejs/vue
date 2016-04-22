import { inBrowser } from './env'
import { warn } from './debug'
import { makeMap } from '../../shared/util'

const builtInTags = 'slot,component,render'

export const isBuiltInTag = makeMap(builtInTags)

export const isReservedTag = makeMap(
  builtInTags +
  'html,base,head,link,meta,style,title,' +
  'address,article,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
)

const unknownElementCache = Object.create(null)
export function isUnknownElement (tag) {
  if (!inBrowser) {
    return true
  }
  tag = tag.toLowerCase()
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag)
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = (
      /HTMLUnknownElement/.test(el.toString()) &&
      // Chrome returns unknown for several HTML5 elements.
      // https://code.google.com/p/chromium/issues/detail?id=540526
      !/^(data|time|rtc|rb)$/.test(tag)
    ))
  }
}

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

export function query (el) {
  if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + selector
      )
    }
  }
  return el
}
