import { VNodeData } from "./vnode";

export type KnownAttrs = Pick<
  VNodeData,
  "class" | "staticClass" | "key" | "ref" | "slot"
> & {
  style?: VNodeData["style"] | string
  id?: string
  refInFor?: boolean
  domPropsInnerHTML?: string
};

type OuterProps<Props, RequiredPropNames extends keyof Props> = {
  [K in RequiredPropNames]: Props[K]
} &
  { [K in Exclude<keyof Props, RequiredPropNames>]?: Props[K] };

/**
 * `_attrs` is a special property for using Vue components as JSX elements.
 * By passing `_attrs` to `JSX.ElementAttributesProperty`, your component's props are
 * exposed as JSX elemnt properties.
 */
export type JSXElementAttributesProperty<Props, RequiredPropsNames extends keyof Props> = {
  _attrs: KnownAttrs & OuterProps<Props, RequiredPropsNames>
};
