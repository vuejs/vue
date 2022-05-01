declare function waitForUpdate(
  cb: Function
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

// @ts-ignore
declare let global: typeof globalThis;
