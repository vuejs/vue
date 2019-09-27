import Vue, { VueConstructor } from "../index";
import { PluginFunction, PluginObject } from "../index";

class Option {
  prefix: string = "";
  suffix: string = "";
}

const plugin: PluginObject<Option> = {
  install(Vue, option) {
    if (typeof option !== "undefined") {
      const {prefix, suffix} = option;
    }
  }
}
const installer: PluginFunction<Option> = function(Vue, option) { }
function NoOptions( _Vue: VueConstructor<Vue> ){};
function OptionalOption( _Vue: VueConstructor<Vue>, options?: Option) {};

Vue.use(plugin, new Option);
Vue.use(installer, new Option);
Vue.use(installer, new Option, new Option, new Option);

Vue.use(NoOptions);
Vue.use(OptionalOption);
Vue.use(OptionalOption, { prefix: '', suffix: '' });
