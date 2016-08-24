import { Vue as _Vue } from "./vue.d";

export interface PluginFunction<T> {
  (Vue: typeof _Vue, options?: T): void;
}

export interface PluginObject<T> {
  install: PluginFunction<T>;
  [key: string]: any;
}
