# Vue.js Contributing Guide

Hi! I’m really excited that you are interested in contributing to Vue.js. Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.

## Issue Reporting Checklist

- Make sure that you are using the latest version of Vue.
- Try to search for your issue, it may have already been answered or even fixed in the development branch.
- It is recommended that you make a JSFiddle to reproduce your issue. You could start with [this template](http://jsfiddle.net/5sH6A/) that already includes the latest version of Vue.
- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

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
- Follow JSDoc.
- 2 spaces indentation.
- multiple var declarations.
- align equal signs where appropriate.
- Return early.
- 1 space after `function`
- 1 space between arguments, but not between parens.
- When in doubt, read the source code.
- Break long ternary conditionals like this:

  ``` js
  var a = superLongConditionalStatement
    ? 'yep'
    : 'nope'
  ```

## Development Setup

You will need [Node](http://nodejs.org), [Grunt](http://gruntjs.com), [PhantomJS](http://phantomjs.org) and [CasperJS](http://casperjs.org).

``` bash
# in case you don’t already these:
# npm install -g grunt-cli phantomjs casperjs
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
# if you don’t have these yet:
# npm install -g phantomjs casperjs
$ grunt test
```

The unit tests are written with Jasmine and run with Karma. The functional tests are written for and run with CasperJS.

**If you are not using a Mac**

You can modify the Gruntfile to only run Karma tests in browsers that are available on your system. Just make sure don’t check in the Gruntfile for the commit.
