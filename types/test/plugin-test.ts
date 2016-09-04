import Vue = require("../index.d");
import { PluginFunction, PluginObject } from "../plugin.d";

class Option {
  prefix: string;
  suffix: string;
}

const plugin: PluginObject<Option> = {
  install(Vue, option) {
    if (typeof option !== "undefined") {
      const {prefix, suffix} = option;
    }
  }
}
const installer: PluginFunction<Option> = function(Vue, option) { }

Vue.use(plugin, new Option);
Vue.use(installer, new Option);
