import {Vue as _Vue} from "./vue";
// `Vue` in `export = Vue` must be a namespace
declare namespace Vue {}
// TS cannot merge imported class with namespace, declare a subclass to bypass
declare class Vue extends _Vue {}
export = Vue;
