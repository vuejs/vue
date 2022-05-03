declare function waitForUpdate(
  cb: Function
): any;

declare function createTextVNode(
  arg?: any
): any;

declare namespace jasmine {
  interface Matchers<T> {
    toHaveBeenWarned(): void;
    toHaveBeenTipped(): void;
  }

  interface ArrayLikeMatchers<T> {
    toHaveBeenWarned(): void;
    toHaveBeenTipped(): void;
  }
}