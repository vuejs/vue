/*
 * @Description:
 * @version:
 * @Author: Murphy
 * @Date: 2022-07-02 12:30:56
 * @LastEditTime: 2022-07-02 18:01:35
 */
/* @flow */

import { mergeOptions } from '../util/index'
// 将mixin拷贝到Vue.options,是全局的选项
export function initMixin(Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
