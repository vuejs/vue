declare class Vue {
  _render: Function;
}

declare interface VNode {
  tag: ?string;
  text: ?string;
  data: ?Object;
  children: ?Array<VNode>;
}
