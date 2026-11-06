export declare function describe(_name: string, _fn: () => void): void
export declare function test(_name: string, _fn: () => any): void

export declare function expectType<T>(value: T): void
export declare function expectError<T>(value: T): void
export declare function expectAssignable<T, T2 extends T = T>(value: T2): void

export type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false
  ? false
  : true

export type IsAny<T> = 0 extends 1 & T ? true : false
