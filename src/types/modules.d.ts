declare module 'de-indent' {
  export default function deindent(input: string): string
}

declare namespace jasmine {
  interface Matchers<T> {
    toHaveBeenWarned(): void
    toHaveBeenTipped(): void
  }

  interface ArrayLikeMatchers<T> {
    toHaveBeenWarned(): void
    toHaveBeenTipped(): void
  }
}
