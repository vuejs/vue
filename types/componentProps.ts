import { Data } from "./component";

export type ComponentPropsOptions<P = Data> =
  | ComponentObjectPropsOptions<P>
  | string[];

export type ComponentObjectPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]> | null;
};

export type Prop<T> = PropOptions<T> | PropType<T>;

type DefaultFactory<T> = () => T | null | undefined;

interface PropOptions<T = any> {
  type?: PropType<T> | true | null;
  required?: boolean;
  default?: T | DefaultFactory<T> | null | undefined;
  validator?(value: unknown): boolean;
}

export type PropType<T> = PropConstructor<T> | PropConstructor<T>[];

type PropConstructor<T = any> =
  | { new (...args: any[]): T & object }
  | { (): T }
  | PropMethod<T>;

type PropMethod<T, TConstructor = any> = T extends (...args: any) => any // if is function with args
  ? { new (): TConstructor; (): T; readonly prototype: TConstructor } // Create Function like constructor
  : never;

type RequiredKeys<T, MakeDefaultRequired> = {
  [K in keyof T]: T[K] extends
    | { required: true }
    | (MakeDefaultRequired extends true ? { default: any } : never)
    ? K
    : never;
}[keyof T];

type OptionalKeys<T, MakeDefaultRequired> = Exclude<
  keyof T,
  RequiredKeys<T, MakeDefaultRequired>
>;

type InferPropType<T> = T extends null
  ? any // null & true would fail to infer
  : T extends { type: null | true }
  ? any // As TS issue https://github.com/Microsoft/TypeScript/issues/14829 // somehow `ObjectConstructor` when inferred from { (): T } becomes `any` // `BooleanConstructor` when inferred from PropConstructor(with PropMethod) becomes `Boolean`
  : T extends ObjectConstructor | { type: ObjectConstructor }
  ? { [key: string]: any }
  : T extends BooleanConstructor | { type: BooleanConstructor }
  ? boolean
  : T extends Prop<infer V>
  ? V
  : T;

export type ExtractPropTypes<
  O,
  MakeDefaultRequired extends boolean = true
> = O extends object
  ? { [K in RequiredKeys<O, MakeDefaultRequired>]: InferPropType<O[K]> } &
      { [K in OptionalKeys<O, MakeDefaultRequired>]?: InferPropType<O[K]> }
  : { [K in string]: any };

const enum BooleanFlags {
  shouldCast,
  shouldCastTrue,
}

type NormalizedProp =
  | null
  | (PropOptions & {
      [BooleanFlags.shouldCast]?: boolean;
      [BooleanFlags.shouldCastTrue]?: boolean;
    });

// normalized value is a tuple of the actual normalized options
// and an array of prop keys that need value casting (booleans and defaults)
export type NormalizedPropsOptions = [Record<string, NormalizedProp>, string[]];
