import { inBrowser } from 'core/util/env'
import { makeMap } from 'shared/util'

export const isReservedTag = makeMap(
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

// attributes that should be using props for binding
export const mustUseProp = makeMap('value,selected,checked,muted')

// this map covers namespace elements that can appear as template root nodes
const isSVG = makeMap(
  'svg,g,defs,symbol,use,image,text,circle,ellipse,' +
  'line,path,polygon,polyline,rect',
  true
)

export function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

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
