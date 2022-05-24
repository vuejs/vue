import { resolve as _resolve } from 'path'
import { defineConfig } from 'vitest/config'

const resolve = (p: string) => _resolve(__dirname, p)

export default defineConfig({
  resolve: {
    alias: {
      compiler: resolve('src/compiler'),
      core: resolve('src/core'),
      server: resolve('src/server'),
      sfc: resolve('src/sfc'),
      shared: resolve('src/shared'),
      web: resolve('src/platforms/web'),
      vca: resolve('src/composition-api'),
      vue: resolve('src/platforms/web/entry-runtime-with-compiler')
    }
  },
  define: {
    __DEV__: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: resolve('test/vitest.setup.ts')
  }
})
