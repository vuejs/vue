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
declare var WXEnvironment: WeexEnvironment;
