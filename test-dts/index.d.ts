export * from '@vue/composition-api'

export function describe(_name: string, _fn: () => void): void

export function expectType<T>(value: T): void
export function expectError<T>(value: T): void
export function expectAssignable<T, T2 extends T = T>(value: T2): void

// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
type IfNotAny<T> = 0 extends 1 & T ? never : T
type IfNotUndefined<T> = Exclude<T, undefined> extends never ? never : T
export function isNotAnyOrUndefined<T>(value: IfNotAny<IfNotUndefined<T>>): void
