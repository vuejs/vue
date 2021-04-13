import "core/config";

declare module "core/config" {
  interface Config {
    isRuntimeComponent: (key: string) => true | undefined;
  }
}
