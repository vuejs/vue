declare const __WEEX__: boolean;
declare type WeexEnvironment = {
  platform: string; // could be "Web", "iOS", "Android"
  weexVersion: string; // the version of WeexSDK

  osName: string; // could be "iOS", "Android" or others
  osVersion: string;
  appName: string; // mobile app name or browser name
  appVersion: string;

  // information about current running device
  deviceModel: string; // phone device model
  deviceWidth: number;
  deviceHeight: number;
  scale: number;

  // only available on the web
  userAgent?: string;
  dpr?: number;
  rem?: number;
};
declare let WXEnvironment: WeexEnvironment;

interface Window {
  __VUE_DEVTOOLS_GLOBAL_HOOK__: DevtoolsHook;
}


// from https://github.com/vuejs/vue-devtools/blob/bc719c95a744614f5c3693460b64dc21dfa339a8/packages/app-backend-api/src/global-hook.ts#L3
interface DevtoolsHook {
  emit: (event: string, ...payload: any[]) => void
  on: (event: string, handler: Function) => void
  once: (event: string, handler: Function) => void
  off: (event?: string, handler?: Function) => void
  Vue?: any
  // apps: AppRecordOptions[]
}
