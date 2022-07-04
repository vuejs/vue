export type Data = { [key: string]: unknown }

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

// Conditional returns can enforce identical types.
// See here: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
// prettier-ignore
type Equal<Left, Right> =
  (<U>() => U extends Left ? 1 : 0) extends (<U>() => U extends Right ? 1 : 0) ? true : false;

export type HasDefined<T> = Equal<T, unknown> extends true ? false : true

// If the the type T accepts type "any", output type Y, otherwise output type N.
// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N

export type LooseRequired<T> = { [P in string & keyof T]: T[P] }
