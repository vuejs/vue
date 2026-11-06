// vue compiler module for transforming `img:srcset` to a number of `require`s

import { urlToRequire } from './utils'
import { TransformAssetUrlsOptions } from './assetUrl'
import { ASTNode } from 'types/compiler'

interface ImageCandidate {
  require: string
  descriptor: string
}

export default (transformAssetUrlsOptions?: TransformAssetUrlsOptions) => ({
  postTransformNode: (node: ASTNode) => {
    transform(node, transformAssetUrlsOptions)
  }
})

// http://w3c.github.io/html/semantics-embedded-content.html#ref-for-image-candidate-string-5
const escapedSpaceCharacters = /( |\\t|\\n|\\f|\\r)+/g

function transform(
  node: ASTNode,
  transformAssetUrlsOptions?: TransformAssetUrlsOptions
) {
  if (node.type !== 1 || !node.attrs) {
    return
  }

  if (node.tag === 'img' || node.tag === 'source') {
    node.attrs.forEach(attr => {
      if (attr.name === 'srcset') {
        // same logic as in transform-require.js
        const value = attr.value
        const isStatic =
          value.charAt(0) === '"' && value.charAt(value.length - 1) === '"'
        if (!isStatic) {
          return
        }

        const imageCandidates: ImageCandidate[] = value
          .slice(1, -1)
          .split(',')
          .map(s => {
            // The attribute value arrives here with all whitespace, except
            // normal spaces, represented by escape sequences
            const [url, descriptor] = s
              .replace(escapedSpaceCharacters, ' ')
              .trim()
              .split(' ', 2)
            return {
              require: urlToRequire(url, transformAssetUrlsOptions),
              descriptor
            }
          })

        // "require(url1)"
        // "require(url1) 1x"
        // "require(url1), require(url2)"
        // "require(url1), require(url2) 2x"
        // "require(url1) 1x, require(url2)"
        // "require(url1) 1x, require(url2) 2x"
        const code = imageCandidates
          .map(
            ({ require, descriptor }) =>
              `${require} + "${descriptor ? ' ' + descriptor : ''}, " + `
          )
          .join('')
          .slice(0, -6)
          .concat('"')
          .replace(/ \+ ""$/, '')

        attr.value = code
      }
    })
  }
}
