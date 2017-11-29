// global flag to be compiled away
declare var __WEEX__: boolean;

declare type WeexCompilerOptions = CompilerOptions & {
  // whether to compile special template for <recycle-list>
  recyclable?: boolean;
};

declare type WeexCompiledResult = CompiledResult & {
  '@render'?: string;
};
