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

  if (isExternalUrl(url) || isDataUrl(url) || firstChar === '#') {
    return returnValue
  }

  const uriParts = parseUriParts(url)
  if (transformAssetUrlsOption.base) {
    // explicit base - directly rewrite the url into absolute url
    // does not apply to absolute urls or urls that start with `@`
    // since they are aliases
    if (firstChar === '.' || firstChar === '~') {
      // when packaged in the browser, path will be using the posix-
      // only version provided by rollup-plugin-node-builtins.
      return `"${(path.posix || path).join(
        transformAssetUrlsOption.base,
        uriParts.path + (uriParts.hash || '')
      )}"`
    }
  }

  if (
    transformAssetUrlsOption.includeAbsolute ||
    firstChar === '.' ||
    firstChar === '~' ||
    firstChar === '@'
  ) {
    if (!uriParts.hash) {
      return `require("${url}")`
    } else {
      // support uri fragment case by excluding it from
      // the require and instead appending it as string;
      // assuming that the path part is sufficient according to
      // the above caseing(t.i. no protocol-auth-host parts expected)
      return `require("${uriParts.path}") + "${uriParts.hash}"`
    }
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
  if (urlString) {
    // A TypeError is thrown if urlString is not a string
    // @see https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost
    if ('string' === typeof urlString) {
      // check is an uri
      return uriParse(urlString) // take apart the uri
    }
  }
  return returnValue
}

const externalRE = /^(https?:)?\/\//
function isExternalUrl(url: string): boolean {
  return externalRE.test(url)
}

const dataUrlRE = /^\s*data:/i
function isDataUrl(url: string): boolean {
  return dataUrlRE.test(url)
}
