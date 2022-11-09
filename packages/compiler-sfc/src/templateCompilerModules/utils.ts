import { isString } from 'shared/util'
import { TransformAssetUrlsOptions } from './assetUrl'
import { UrlWithStringQuery, parse as uriParse } from 'url'
import path from 'path'

export function urlToRequire(
  url: string,
  transformAssetUrlsOption: TransformAssetUrlsOptions = {}
): string {
  const returnValue = `"${url}"`
  // same logic as in transform-require.js
  const firstChar = url.charAt(0)
  if (firstChar === '~') {
    const secondChar = url.charAt(1)
    url = url.slice(secondChar === '/' ? 2 : 1)
  }

  if (isExternalUrl(url) || isDataUrl(url) || firstChar === '#')
    return returnValue

  const uriParts = parseUriParts(url)
  if (
    transformAssetUrlsOption.base &&
    (firstChar === '.' || firstChar === '~')
  ) {
    // explicit base - directly rewrite the url into absolute url
    // does not apply to absolute urls or urls that start with `@`
    // since they are aliases
    // Allow for full hostnames provided in options.base
    const base = parseUriParts(transformAssetUrlsOption.base)
    const protocol = base.protocol || ''
    const host = base.host ? protocol + '//' + base.host : ''
    const basePath = base.path || '/'
    // when packaged in the browser, path will be using the posix-
    // only version provided by rollup-plugin-node-builtins.
    return `"${host}${(path.posix || path).join(
      basePath,
      uriParts.path + (uriParts.hash || '')
    )}"`
  }

  if (
    transformAssetUrlsOption.includeAbsolute ||
    firstChar === '.' ||
    firstChar === '~' ||
    firstChar === '@'
  ) {
    // support uri fragment case by excluding it from
    // the require and instead appending it as string;
    // assuming that the path part is sufficient according to
    // the above caseing(t.i. no protocol-auth-host parts expected)
    return !uriParts.hash
      ? `require("${url}")`
      : `require("${uriParts.path}") + "${uriParts.hash}"`
  }
  return returnValue
}

/**
 * vuejs/component-compiler-utils#22 Support uri fragment in transformed require
 * @param urlString an url as a string
 */
function parseUriParts(urlString: string): UrlWithStringQuery {
  // initialize return value
  const returnValue: UrlWithStringQuery = uriParse('')
  return urlString && isString(urlString)
    ? uriParse(urlString, false, true) // take apart the uri
    : returnValue
}

const externalRE = /^(https?:)?\/\//
function isExternalUrl(url: string): boolean {
  return externalRE.test(url)
}

const dataUrlRE = /^\s*data:/i
function isDataUrl(url: string): boolean {
  return dataUrlRE.test(url)
}
