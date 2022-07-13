import { Vue as _Vue } from "./vue";

type GetPluginRestParams<T> = T extends PluginFunction ? getTupleType<T> : T extends PluginObject ? getTupleType<T['install']> : [];
type getTupleType<T> = T extends (vue: typeof _Vue, ...rest: infer T) => void ? T : never
type Assert<T, U> = T extends U ? T : never;

export type PluginFunction = (Vue: typeof _Vue, ...options: any[]) => void;
export type RestParams<T> = Assert<GetPluginRestParams<T>, any[]>;

export interface PluginObject {
install: PluginFunction;
  [key: string]: any;
}
