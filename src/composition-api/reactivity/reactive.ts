export declare const ShallowReactiveMarker: unique symbol

export function reactive() {}

export function isReactive(value: unknown): boolean {
  return !!(value && (value as any).__ob__)
}

export function isShallow(value: unknown): boolean {
  // TODO
  return !!(value && (value as any).__ob__)
}
