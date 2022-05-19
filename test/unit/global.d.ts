declare function waitForUpdate(
  cb: Function
): any;

declare function createTextVNode(
  arg?: any
): any;

// vitest extends jest namespace so we can just extend jest.Matchers
declare namespace jest {
  interface Matchers<R, T> {
    toHaveBeenWarned(): R
    toHaveBeenWarnedLast(): R
    toHaveBeenWarnedTimes(n: number): R
  }
}
