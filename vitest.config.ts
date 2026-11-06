import { resolve as _resolve } from 'path'
import { defineConfig } from 'vitest/config'

const resolve = (p: string) => _resolve(__dirname, p)

export default defineConfig({
  resolve: {
    alias: {
      compiler: resolve('src/compiler'),
      core: resolve('src/core'),
      server: resolve('packages/server-renderer/src'),
      sfc: resolve('packages/compiler-sfc/src'),
      shared: resolve('src/shared'),
      web: resolve('src/platforms/web'),
      v3: resolve('src/v3'),
      vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
      types: resolve('src/types')
    }
  },
  define: {
    __DEV__: true,
    __TEST__: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve('test/vitest.setup.ts')
  }
})
