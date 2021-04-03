declare function waitForUpdate(cb: Function): Promise<any>

declare interface Window {
  waitForUpdate(cb: Function): Promise<any>
}
