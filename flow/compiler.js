declare type CompilerOptions = {
  warn?: Function,
  expectHTML?: boolean,
  directives?: Array<Function>,
  isUnaryTag?: (tag: string) => ?boolean,
  isReservedTag?: (tag: string) => ?boolean,
  mustUseProp?: (attr: string) => ?boolean,
  getTagNamespace?: (tag: string) => ?string,
  delimiters?: [string, string]
}

declare type ASTText = {
  text: string
}

declare type ASTExpression = {
  expression: string,
  text?: string
}

declare type ASTElement = {
  tag: string,
  attrsList: Array<{ name: string, value: string }>,
  attrsMap: { [key: string]: string },
  parent: ASTElement | void,
  children: Array<ASTElement | ASTText | ASTExpression>,

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

  if?: string,
  else?: true,
  elseBlock?: ASTElement,

  for?: string,
  key?: string,
  alias?: string,
  iterator?: string,

  staticClass?: string,
  classBinding?: string,
  styleBinding?: string,

  transition?: string | true,
  transitionOnAppear?: boolean,

  forbidden?: true,
  once?: true
}
