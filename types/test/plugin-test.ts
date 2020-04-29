import Vue, { VueConstructor } from "../index";
import { PluginFunction, PluginObject } from "../index";

class Option {
  prefix?: string = "";
  suffix: string = "";
}

const plugin: PluginObject = {
  install(Vue, option) {
    if (typeof option !== "undefined") {
      const {prefix, suffix} = option;
    }
  }
}
const installer: PluginFunction = function(Vue, option) { }
function NoOptions( _Vue: VueConstructor<Vue>){};
function OptionalOption( _Vue: VueConstructor<Vue>, options?: Option, other?: Option, another?: Option) {};

Vue.use(NoOptions);
Vue.use(OptionalOption, {prefix: '', suffix: ''}, {prefix: '', suffix: ''}, { suffix: ''});
Vue.use(OptionalOption);

Vue.use(plugin);
Vue.use(installer, new Option, new Option);
Vue.use(installer, new Option, new Option, new Option);
