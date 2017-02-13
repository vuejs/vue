declare module 'he' {
  declare function escape(html: string): string;
  declare function decode(html: string): string;
}

declare module 'source-map' {
  declare class SourceMapGenerator {
    setSourceContent(filename: string, content: string): void;
    addMapping(mapping: Object): void;
    toString(): string;
  }
  declare class SourceMapConsumer {
    originalPositionFor(position: { line: number; column: number; }): {
      source: ?string;
      line: ?number;
      column: ?number;
    };
  }
}

declare module 'lru-cache' {
  declare var exports: {
    (): any
  }
}

declare module 'de-indent' {
  declare var exports: {
    (input: string): string
  }
}

declare module 'vue-ssr-html-stream' {
  declare interface parsedTemplate {
    head: string;
    neck: string;
    tail: string;
  }
  declare interface HTMLStreamOptions {
    template: string | parsedTemplate;
    context?: ?Object;
  }
  declare class exports extends stream$Transform {
    constructor(options: HTMLStreamOptions): void;
    static parseTemplate(template: string): parsedTemplate;
    static renderTemplate(template: parsedTemplate, content: string, context?: ?Object): string;
  }
}
