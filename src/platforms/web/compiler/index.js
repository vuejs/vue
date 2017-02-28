/* @flow */

import { isUnaryTag } from './util'
import { genStaticKeys } from 'shared/util'
import { createCompiler } from 'compiler/index'

import modules from './modules/index'
import directives from './directives/index'

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}

const { compile, compileToFunctions } = createCompiler(baseOptions)
export { compile, compileToFunctions }
