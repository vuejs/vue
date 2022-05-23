import { DefinePlugin } from 'webpack'

interface WebpackPluginOptions {
  filename?: string
}

export interface WebpackPlugin {
  // NOTE NOT SURE ABOUT THIS
  // TODO DOUBLE CHECK HERE
  new (options?: WebpackPluginOptions): DefinePlugin
}
