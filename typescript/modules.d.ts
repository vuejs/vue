declare module 'he' {
  function escape(html: string): string
  function decode(html: string): string
}

declare module 'source-map' {
  class SourceMapGenerator {
    setSourceContent(filename: string, content: string): void
    addMapping(mapping: Object): void
    toString(): string
  }
  class SourceMapConsumer {
    constructor(map: Object)
    originalPositionFor(position: {
      line: number
      column: number
    }): {
      source: string | null
      line: number | null
      column: number | null
    }
  }
}

declare module 'lru-cache' {
  var exports: {
    (): any
  }
}

declare module 'de-indent' {
  var exports: {
    (input: string): string
  }
}

declare module 'serialize-javascript' {
  var exports: {
    (input: string, options: { isJSON: boolean }): string
  }
}

declare module 'lodash.template' {
  var exports: {
    (input: string, options: { interpolate: RegExp; escape: RegExp }): Function
  }
}
