import { WarningMessage } from 'types/compiler'
import { SFCDescriptor } from './parseComponent'

export interface StartOfSourceMap {
  file?: string
  sourceRoot?: string
}

export interface RawSourceMap extends StartOfSourceMap {
  version: string
  sources: string[]
  names: string[]
  sourcesContent?: string[]
  mappings: string
}

export interface VueTemplateCompiler {
  parseComponent(source: string, options?: any): SFCDescriptor

  compile(
    template: string,
    options: VueTemplateCompilerOptions
  ): VueTemplateCompilerResults

  ssrCompile(
    template: string,
    options: VueTemplateCompilerOptions
  ): VueTemplateCompilerResults
}

// we'll just shim this much for now - in the future these types
// should come from vue-template-compiler directly, or this package should be
// part of the vue monorepo.
export interface VueTemplateCompilerOptions {
  modules?: Object[]
  outputSourceRange?: boolean
  whitespace?: 'preserve' | 'condense'
  directives?: { [key: string]: Function }
}

export interface VueTemplateCompilerResults {
  ast: Object | undefined
  render: string
  staticRenderFns: string[]
  errors: (string | WarningMessage)[]
  tips: (string | WarningMessage)[]
}

export const enum BindingTypes {
  /**
   * returned from data()
   */
  DATA = 'data',
  /**
   * declared as a prop
   */
  PROPS = 'props',
  /**
   * a local alias of a `<script setup>` destructured prop.
   * the original is stored in __propsAliases of the bindingMetadata object.
   */
  PROPS_ALIASED = 'props-aliased',
  /**
   * a let binding (may or may not be a ref)
   */
  SETUP_LET = 'setup-let',
  /**
   * a const binding that can never be a ref.
   * these bindings don't need `unref()` calls when processed in inlined
   * template expressions.
   */
  SETUP_CONST = 'setup-const',
  /**
   * a const binding that does not need `unref()`, but may be mutated.
   */
  SETUP_REACTIVE_CONST = 'setup-reactive-const',
  /**
   * a const binding that may be a ref.
   */
  SETUP_MAYBE_REF = 'setup-maybe-ref',
  /**
   * bindings that are guaranteed to be refs
   */
  SETUP_REF = 'setup-ref',
  /**
   * declared by other options, e.g. computed, inject
   */
  OPTIONS = 'options'
}

export type BindingMetadata = {
  [key: string]: BindingTypes | undefined
} & {
  __isScriptSetup?: boolean
}
