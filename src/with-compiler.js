import { compile } from './compiler/index'
import { getOuterHTML, query } from './util/index'
import Component from './instance/index'

export default function Vue (options) {
  if (!options.render) {
    if (options.template) {
      options.render = compile(options.template)
    } else if (options.el) {
      options.render = compile(getOuterHTML(query(options.el)))
    }
  }
  return new Component(options)
}
