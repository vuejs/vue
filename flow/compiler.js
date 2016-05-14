declare type CompilerOptions = {
  warn?: Function,
  expectHTML?: boolean,
  directives?: { [key: string]: Function },
  isUnaryTag?: (tag: string) => ?boolean,
  isReservedTag?: (tag: string) => ?boolean,
  mustUseProp?: (attr: string) => ?boolean,
  getTagNamespace?: (tag: string) => ?string,
  delimiters?: [string, string]
}

declare type ASTText = {
  text?: string,
  expression?: string
}

declare type ASTElement = {
  tag: string,
  attrsList: Array<{ name: string, value: string }>,
  attrsMap: { [key: string]: string },
  parent: ASTElement | void,
  children: Array<any>,

  static?: boolean,
  staticRoot?: true,

  text?: string,
  attrs?: Array<{ name: string, value: string }>,
  plain?: boolean,
  pre?: true,
  ns?: string,

  component?: string,
  inlineTemplate?: true,
  slotName?: string,
  slotTarget?: string,

  render?: true,
  renderMethod?: string,
  renderArgs?: string,

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

  transition?: string | true,
  transitionOnAppear?: boolean,

  directives?: Array<{
    name: string,
    value?: string,
    arg?: string,
    modifiers?: { [key: string]: true }
  }>,

  forbidden?: true,
  once?: true
}
