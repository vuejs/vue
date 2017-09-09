# Vue.js Contributing Guide

Hi! I’m really excited that you are interested in contributing to Vue.js. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

- [Code of Conduct](https://github.com/vuejs/vue/blob/dev/.github/CODE_OF_CONDUCT.md)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Financial Contributions](#financial-contributions)

## Issue Reporting Guidelines

- Always use [https://new-issue.vuejs.org/](https://new-issue.vuejs.org/) to create new issues.

## Pull Request Guidelines

- The `master` branch is basically just a snapshot of the latest stable release. All development should be done in dedicated branches. **Do not submit PRs against the `master` branch.**

- Checkout a topic branch from the relevant branch, e.g. `dev`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- Make sure `npm test` passes. (see [development setup](#development-setup))

- If adding new feature:
  - Add accompanying test case.
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - If you are resolving a special issue, add `(fix #xxxx[,#xxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

## Development Setup

You will need [Node.js](http://nodejs.org) **version 6+** and [Java Runtime Environment](http://www.oracle.com/technetwork/java/javase/downloads/index.html) (needed for running Selenium server during e2e tests).

After cloning the repo, run:

``` bash
$ npm install
& npm run setup
```

The `setup` script links two git hooks:

- `pre-commit`: runs ESLint on staged files.
- `commit-msg`: validates commit message format (see below).

### Committing Changes

Commit messages should follow the [commit message convention](./COMMIT_CONVENTION.md) so that changelogs can be automatically generated. If git hooks have been properly linked, commit messages will be automatically validated upon commit. It is recommended to use `npm run commit` instead of `git commit`, which provides an interactive CLI for generating proper commit messages.

### Commonly used NPM scripts

``` bash
# watch and auto re-build dist/vue.js
$ npm run dev

# watch and auto re-run unit tests in Chrome
$ npm run dev:test

# build all dist files, including npm packages
$ npm run build

# run the full test suite, include linting / type checking
$ npm test
```

There are some other scripts available in the `scripts` section of the `package.json` file.

The default test script will do the following: lint with ESLint -> type check with Flow -> unit tests with coverage -> e2e tests. **Please make sure to have this pass successfully before submitting a PR.** Although the same tests will be run against your PR on the CI server, it is better to have it working locally beforehand.

## Project Structure

- **`build`**: contains build-related configuration files. In most cases you don't need to touch them. However, it would be helpful to familiarize yourself with the following files:

  - `build/alias.js`: module import aliases used across all source code and tests.

  - `build/config.js`: contains the build configurations for all files found in `dist/`. Check this file if you want to find out the entry source file for a dist file.

- **`dist`**: contains built files for distribution. Note this directory is only updated when a release happens; they do not reflect the latest changes in development branches.

  See [dist/README.md](https://github.com/vuejs/vue/blob/dev/dist/README.md) for more details on dist files.

- **`flow`**: contains type declarations for [Flow](https://flowtype.org/). These declarations are loaded **globally** and you will see them used in type annotations in normal source code.

- **`packages`**: contains `vue-server-renderer` and `vue-template-compiler`, which are distributed as separate NPM packages. They are automatically generated from the source code and always have the same version with the main `vue` package.

- **`test`**: contains all tests. The unit tests are written with [Jasmine](http://jasmine.github.io/2.3/introduction.html) and run with [Karma](http://karma-runner.github.io/0.13/index.html). The e2e tests are written for and run with [Nightwatch.js](http://nightwatchjs.org/).

- **`src`**: contains the source code, obviously. The codebase is written in ES2015 with [Flow](https://flowtype.org/) type annotations.

  - **`compiler`**: contains code for the template-to-render-function compiler.

    The compiler consists of a parser (converts template strings to element ASTs), an optimizer (detects static trees for vdom render optimization), and a code generator (generate render function code from element ASTs). Note the codegen directly generates code strings from the element AST - it's done this way for smaller code size because the compiler is shipped to the browser in the standalone build.

  - **`core`**: contains universal, platform-agnostic runtime code.

    The Vue 2.0 core is platform-agnostic - which means code inside `core` should be able to run in any JavaScript environment, be it the browser, Node.js, or an embedded JavaScript runtime in native applications.

    - **`observer`**: contains code related to the reactivity system.

    - **`vdom`**: contains code related to vdom element creation and patching.

    - **`instance`**: contains Vue instance constructor and prototype methods.

    - **`global-api`**: as the name suggests.

    - **`components`**: universal abstract components. Currently `keep-alive` is the only one.

  - **`server`**: contains code related to server-side rendering.

  - **`platforms`**: contains platform-specific code.

    Entry files for dist builds are located in their respective platform directory.

    Each platform module contains three parts: `compiler`, `runtime` and `server`, corresponding to the three directories above. Each part contains platform-specific modules/utilities which are then imported and injected to the core counterparts in platform-specific entry files. For example, the code implementing the logic behind `v-bind:class` is in `platforms/web/runtime/modules/class.js` - which is imported in `entries/web-runtime.js` and used to create the browser-specific vdom patching function.

  - **`sfc`**: contains single-file component (`*.vue` files) parsing logic. This is used in the `vue-template-compiler` package.

  - **`shared`**: contains utilities shared across the entire codebase.

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/vuejs).
Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

## Credits

### Contributors

Thank you to all the people who have already contributed to vuejs!
<a href="graphs/contributors"><img src="https://opencollective.com/vuejs/contributors.svg?width=890" /></a>


### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/vuejs#backer)]

<a href="https://opencollective.com/vuejs#backers" target="_blank"><img src="https://opencollective.com/vuejs/backers.svg?width=890"></a>


### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/vuejs#sponsor))

<a href="https://opencollective.com/vuejs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/10/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/11/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/12/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/13/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/14/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/15/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/16/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/17/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/18/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/19/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/20/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/21/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/22/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/23/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/24/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/25/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/26/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/27/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/28/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/vuejs/sponsor/29/website" target="_blank"><img src="https://opencollective.com/vuejs/sponsor/29/avatar.svg"></a>