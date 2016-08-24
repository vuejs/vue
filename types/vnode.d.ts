import { Vue } from "./vue.d";


export interface VNodeDirective {
  name: string;
  value: any;
  oldValue: any;
  expression: any;
  arg: string;
  modifiers: {[key: string]: boolean};
}

export interface VNode {
  //
}
