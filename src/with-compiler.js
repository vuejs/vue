import config from './config'
import { compile } from './compiler/index'
import { getOuterHTML, query } from './util/index'
import Component from './instance/index'

export default function Vue (options) {
  if (!options.render) {
    const template = options.template || getOuterHTML(query(options.el))
    options.render = compile(template, config.preserveWhiteSpace)
  }
  return new Component(options)
}
