import Vue, { VNode } from "vue"

/*
 * Template compilation options / results
 */
interface CompilerOptions {
  modules?: ModuleOptions[];
  directives?: Record<string, DirectiveFunction>;
  preserveWhitespace?: boolean;
  whitespace?: 'preserve' | 'condense';
  outputSourceRange?: any
}

interface CompilerOptionsWithSourceRange extends CompilerOptions {
  outputSourceRange: true
}

interface ErrorWithRange {
  msg: string;
  start: number;
  end: number;
}

interface CompiledResult<ErrorType> {
  ast: ASTElement | undefined;
  render: string;
  staticRenderFns: string[];
  errors: ErrorType[];
  tips: ErrorType[];
}

interface CompiledResultFunctions {
  render: () => VNode;
  staticRenderFns: (() => VNode)[];
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

/**
 * - 0: FALSE - whole sub tree un-optimizable
 * - 1: FULL - whole sub tree optimizable
 * - 2: SELF - self optimizable but has some un-optimizable children
 * - 3: CHILDREN - self un-optimizable but have fully optimizable children
 * - 4: PARTIAL - self un-optimizable with some un-optimizable children
 */
export type SSROptimizability = 0 | 1 | 2 | 3 | 4

export interface ASTModifiers {
  [key: string]: boolean;
}

export interface ASTIfCondition {
  exp: string | undefined;
  block: ASTElement;
}

export interface ASTElementHandler {
  value: string;
  params?: any[];
  modifiers: ASTModifiers | undefined;
}

export interface ASTElementHandlers {
  [key: string]: ASTElementHandler | ASTElementHandler[];
}

export interface ASTDirective {
  name: string;
  rawName: string;
  value: string;
  arg: string | undefined;
  modifiers: ASTModifiers | undefined;
}

export type ASTNode = ASTElement | ASTText | ASTExpression;

export interface ASTElement {
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
  ssrOptimizability?: SSROptimizability;

  // weex specific
  appendAsTree?: boolean;
}

export interface ASTExpression {
  type: 2;
  expression: string;
  text: string;
  tokens: (string | Record<string, any>)[];
  static?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: SSROptimizability;
}

export interface ASTText {
  type: 3;
  text: string;
  static?: boolean;
  isComment?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: SSROptimizability;
}

/*
 * SFC parser related types
 */
interface SFCParserOptions {
  pad?: true | 'line' | 'space';
}

export interface SFCBlock {
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

export interface SFCDescriptor {
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
  options: CompilerOptionsWithSourceRange
): CompiledResult<ErrorWithRange>

export function compile(
  template: string,
  options?: CompilerOptions
): CompiledResult<string>;

export function compileToFunctions(template: string): CompiledResultFunctions;

export function ssrCompile(
  template: string,
  options: CompilerOptionsWithSourceRange
): CompiledResult<ErrorWithRange>;

export function ssrCompile(
  template: string,
  options?: CompilerOptions
): CompiledResult<string>;

export function ssrCompileToFunctions(template: string): CompiledResultFunctions;

export function parseComponent(
  file: string,
  options?: SFCParserOptions
): SFCDescriptor;

export function generateCodeFrame(
  template: string,
  start: number,
  end: number
): string;
