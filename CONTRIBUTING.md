# Vue.js Contributing Guide

Hi! I'm really excited that you are interested in contributing to Vue.js. Before submitting a pull request though, please make sure to take a moment and read through the following guidelines.

## Pull Request Checklist

- Checkout a topic branch from `dev` and merge back against `dev`.
- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.
- Squash the commit if there are too many small ones.
- Follow the [code style](#code-style).
- Make sure the default grunt task passes. (see [development setup](#development-setup))
- If adding new feature:
    - Add accompanying test case.
    - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.
- If fixing a bug:
    - Provide detailed description of the bug in the PR. Live demo preferred.
    - Add appropriate test coverage if applicable.

## Code Style

- [No semicolons unless necessary](http://inimino.org/~inimino/blog/javascript_semicolons).
- 4 spaces indentation.
- Single var definition, align equal signs where possible.
- Return early in one line if possible.
- When in doubt, read the source code.
- Break long ternary conditionals:

``` js
var a = superLongConditionalStatement
    ? 'yep'
    : 'nope'
```

## Development Setup

You will need [Node](http://nodejs.org), [Grunt](http://gruntjs.com), [PhantomJS](http://phantomjs.org) and [CasperJS](http://casperjs.org).

``` bash
# in case you don't already it:
# npm install -g grunt-cli
$ npm install
```

To watch and auto-build `dist/vue.js` during development:

``` bash
$ grunt watch
```

To lint:

``` bash
grunt jshint
```

To build:

``` bash
$ grunt build
```

To test:

``` bash
# if you don't have these yet:
# npm install -g phantomjs casperjs
$ grunt test
```

The unit tests are written with Mocha + Chai and run with Karma. The functional tests are written and run with CasperJS.

**If you are not using a Mac**

You can modify the Gruntfile to only run Karma tests in browsers that are available on your system. Just make sure don't check in the Gruntfile for the commit.