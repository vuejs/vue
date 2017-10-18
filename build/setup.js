const { test, ln, chmod, cd, exec } = require('shelljs')
const path = require('path')

const baseUrl = path.resolve()

function installHooks () {
  if (test('-e', '.git/hooks')) {
    ln('-sf', '../../build/git-hooks/pre-commit', '.git/hooks/pre-commit')
    chmod('+x', '.git/hooks/pre-commit')
    ln('-sf', '../../build/git-hooks/commit-msg', '.git/hooks/commit-msg')
    chmod('+x', '.git/hooks/commit-msg')
  }
}

function setupSSR () {
  const ssrBase = path.resolve('packages/vue-server-renderer')
  if (!test('-e', path.join(ssrBase, 'node_modules'))) {
    cd(ssrBase)
    exec('npm install')
    cd(baseUrl)
  }
}

installHooks()
setupSSR()

