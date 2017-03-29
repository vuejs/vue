/* @flow */

/**
 * Creates a mapper that maps files used during a server-side render
 * to async chunk files in the client-side build, so that we can inline them
 * directly in the rendered HTML to avoid waterfall requests.
 */

import type { ServerManifest, ClientManifest } from './index'

export type AsyncFileMapper = (files: Array<string>) => Array<string>;

export function createMapper (
  serverManifest: ServerManifest,
  clientManifest: ClientManifest
): AsyncFileMapper {
  const fileMap = createFileMap(serverManifest, clientManifest)

  return function mapFiles (files: Array<string>): Array<string> {
    const res = new Set()
    for (let i = 0; i < files.length; i++) {
      const mapped = fileMap.get(files[i])
      if (mapped) {
        for (let j = 0; j < mapped.length; j++) {
          res.add(mapped[j])
        }
      }
    }
    return Array.from(res)
  }
}

function createFileMap (serverManifest, clientManifest) {
  const fileMap = new Map()
  Object.keys(serverManifest.modules).forEach(file => {
    fileMap.set(file, mapFile(serverManifest.modules[file], clientManifest))
  })
  return fileMap
}

function mapFile (moduleIds, clientManifest) {
  const files = new Set()
  moduleIds.forEach(id => {
    const fileIndices = clientManifest.modules[id]
    if (fileIndices) {
      fileIndices.forEach(index => {
        const file = clientManifest.all[index]
        // only include async files
        if (clientManifest.async.indexOf(file) > -1) {
          files.add(file)
        }
      })
    }
  })
  return Array.from(files)
}
