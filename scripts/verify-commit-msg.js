const pc = require('picocolors')
const msgPath = process.env.GIT_PARAMS
const msg = require('fs').readFileSync(msgPath, 'utf-8').trim()

const commitRE =
  /^(revert: )?(wip|release|feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types|build)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  ${pc.bgRed.white(' ERROR ')} ${pc.red(
      `invalid commit message format.`
    )}\n\n` +
      pc.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${pc.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${pc.green(`fix(v-model): handle events on blur (close #28)`)}\n\n` +
      pc.red(`  See .github/COMMIT_CONVENTION.md for more details.\n`)
  )
  process.exit(1)
}
