declare type CompilerOptions = {
  warn?: Function,
  isIE?: boolean,
  expectHTML?: boolean,
  preserveWhitespace?: boolean,
  modules?: Array<ModuleOptions>,
  staticKeys?: string,
  directives?: { [key: string]: Function },
  isUnaryTag?: (tag: string) => ?boolean,
  isReservedTag?: (tag: string) => ?boolean,
  mustUseProp?: (attr: string) => ?boolean,
  getTagNamespace?: (tag: string) => ?string,
  delimiters?: [string, string]
}

declare type ModuleOptions = {
  staticKeys?: Array<string>,
  parse: Function,
  genData: Function
}

declare type ASTElementHandler = {
  value: string,
  modifiers: ?{ [key: string]: true }
}

declare type ASTElementHandlers = {
  [key: string]: ASTElementHandler | Array<ASTElementHandler>
}

declare type ASTElementHooks = { [key: string]: Array<string> }

declare type ASTDirective = {
  name: string,
  value: ?string,
  arg: ?string,
  modifiers: ?{ [key: string]: true }
}

declare type ASTNode = ASTElement | ASTText | ASTExpression

declare type ASTElement = {
  type: 1,
  tag: string,
  attrsList: Array<{ name: string, value: string }>,
  attrsMap: { [key: string]: string | null },
  parent: ASTElement | void,
  children: Array<ASTNode>,

  static?: boolean,
  staticRoot?: boolean,

  text?: string,
  attrs?: Array<{ name: string, value: string }>,
  props?: Array<{ name: string, value: string }>,
  staticAttrs?: Array<{ name: string, value: string }>,
  plain?: boolean,
  pre?: true,
  ns?: string,

  component?: string,
  inlineTemplate?: true,
  slotName?: ?string,
  slotTarget?: ?string,

  ref?: string,
  refInFor?: boolean,

  render?: true,
  renderMethod?: ?string,
  renderArgs?: ?string,

  if?: string | null,
  else?: true,
  elseBlock?: ASTElement,

  for?: string | null,
  key?: string,
  alias?: string,
  iterator?: string,

  staticClass?: string,
  classBinding?: string,
  styleBinding?: string,
  hooks?: ASTElementHooks,
  events?: ASTElementHandlers,

  transition?: string | true,
  transitionOnAppear?: boolean,

  directives?: Array<ASTDirective>,

  forbidden?: true,
  once?: true
}

declare type ASTExpression = {
  type: 2,
  expression: string,
  static?: boolean
}

declare type ASTText = {
  type: 3,
  text: string,
  static?: boolean
}
