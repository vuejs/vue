/*
 * Template compilation options / results
 */
interface CompilerOptions {
  modules?: ModuleOptions[];
  directives?: Record<string, DirectiveFunction>;
  preserveWhitespace?: boolean;
}

interface CompiledResult {
  ast: ASTElement | undefined;
  render: string;
  staticRenderFns: string[];
  errors: string[];
}

interface CompiledResultFunctions {
  render: Function;
  staticRenderFns: Function[];
}

interface ModuleOptions {
  preTransformNode: (el: ASTElement) => ASTElement | undefined;
  transformNode: (el: ASTElement) => ASTElement | undefined;
  postTransformNode: (el: ASTElement) => void;
  genData: (el: ASTElement) => string;
  transformCode?: (el: ASTElement, code: string) => string;
  staticKeys?: string[];
}

type DirectiveFunction = (node: ASTElement, directiveMeta: ASTDirective) => void;

/*
 * AST Types
 */
interface ASTModifiers {
  [key: string]: boolean;
}

interface ASTIfCondition {
  exp: string | undefined;
  block: ASTElement;
}

interface ASTElementHandler {
  value: string;
  params?: any[];
  modifiers: ASTModifiers | undefined;
}

interface ASTElementHandlers {
  [key: string]: ASTElementHandler | ASTElementHandler[];
}

interface ASTDirective {
  name: string;
  rawName: string;
  value: string;
  arg: string | undefined;
  modifiers: ASTModifiers | undefined;
}

type ASTNode = ASTElement | ASTText | ASTExpression;

interface ASTElement {
  type: 1;
  tag: string;
  attrsList: { name: string; value: any }[];
  attrsMap: Record<string, any>;
  parent: ASTElement | undefined;
  children: ASTNode[];

  processed?: true;

  static?: boolean;
  staticRoot?: boolean;
  staticInFor?: boolean;
  staticProcessed?: boolean;
  hasBindings?: boolean;

  text?: string;
  attrs?: { name: string; value: any }[];
  props?: { name: string; value: string }[];
  plain?: boolean;
  pre?: true;
  ns?: string;

  component?: string;
  inlineTemplate?: true;
  transitionMode?: string | null;
  slotName?: string;
  slotTarget?: string;
  slotScope?: string;
  scopedSlots?: Record<string, ASTElement>;

  ref?: string;
  refInFor?: boolean;

  if?: string;
  ifProcessed?: boolean;
  elseif?: string;
  else?: true;
  ifConditions?: ASTIfCondition[];

  for?: string;
  forProcessed?: boolean;
  key?: string;
  alias?: string;
  iterator1?: string;
  iterator2?: string;

  staticClass?: string;
  classBinding?: string;
  staticStyle?: string;
  styleBinding?: string;
  events?: ASTElementHandlers;
  nativeEvents?: ASTElementHandlers;

  transition?: string | true;
  transitionOnAppear?: boolean;

  model?: {
    value: string;
    callback: string;
    expression: string;
  };

  directives?: ASTDirective[];

  forbidden?: true;
  once?: true;
  onceProcessed?: boolean;
  wrapData?: (code: string) => string;
  wrapListeners?: (code: string) => string;

  // 2.4 ssr optimization
  ssrOptimizability?: number;

  // weex specific
  appendAsTree?: boolean;
}

interface ASTExpression {
  type: 2;
  expression: string;
  text: string;
  tokens: (string | Record<string, any>)[];
  static?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
}

interface ASTText {
  type: 3;
  text: string;
  static?: boolean;
  isComment?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
}

/*
 * SFC parser related types
 */
interface SFCParserOptions {
  pad?: true | 'line' | 'space';
}

interface SFCBlock {
  type: string;
  content: string;
  attrs: Record<string, string>;
  start?: number;
  end?: number;
  lang?: string;
  src?: string;
  scoped?: boolean;
  module?: string | boolean;
}

interface SFCDescriptor {
  template: SFCBlock | undefined;
  script: SFCBlock | undefined;
  styles: SFCBlock[];
  customBlocks: SFCBlock[];
}

/*
 * Exposed functions
 */
export function compile(
  template: string,
  options?: CompilerOptions
): CompiledResult;

export function compileToFunctions(template: string): CompiledResultFunctions;

export function ssrCompile(
  template: string,
  options?: CompilerOptions
): CompiledResult;

export function ssrCompileToFunctions(template: string): CompiledResultFunctions;

export function parseComponent(
  file: string,
  options?: SFCParserOptions
): SFCDescriptor;
