import { Vue as _Vue } from "./vue.d";

export interface Installer<T> {
  (Vue: typeof _Vue, options: T): void;
}

export interface Plugin<T> {
  install: Installer<T>;
  [key: string]: any;
}
