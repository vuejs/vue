declare type CompilerOptions = {
  warn?: Function,
  expectHTML?: boolean,
  preserveWhitespace?: boolean,
  directives?: { [key: string]: Function },
  isUnaryTag?: (tag: string) => ?boolean,
  isReservedTag?: (tag: string) => ?boolean,
  mustUseProp?: (attr: string) => ?boolean,
  getTagNamespace?: (tag: string) => ?string,
  delimiters?: [string, string]
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

declare type ASTText = {
  text?: string,
  expression?: string
}

declare type ASTElement = {
  tag: string,
  attrsList: Array<{ name: string, value: string }>,
  attrsMap: { [key: string]: string | null },
  parent: ASTElement | void,
  children: Array<any>, // for flexibility

  static?: boolean,
  staticRoot?: true,

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
