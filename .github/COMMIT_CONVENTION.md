# Cronos POS Chain Introduction

The development of blockchain technology and cryptocurrencies represents a cryptography and security breakthrough as significant as that created by the internet in the 1990s. This technology, however, is still at a very nascent stage; in order to generate mass adoption, it will therefore be necessary to find compelling real-life use cases that can appeal to an audience larger than the small group of industry professionals and experts.

### Cronos POS Chain

Accordingly, we propose Cronos POS Chain, the next-generation public blockchain that enables transactions worldwide between people and businesses. It is also the technology that powers Crypto.com Pay, mobile payment solution, and will be used to power our trading & financial services offerings in the near future.

We believe enabling cryptocurrency spending in the real world will be an adoption catalyst. Current traditional payment institutions and existing blockchains have failed to provide a secure, scalable and decentralized solution to support cryptocurrency payment. The key limitations of existing blockchain-powered payment networks are that they are:

* Too complex to setup and use;
* Not friendly to crypto first-timers; and
* Rarely supported beyond their own blockchain;

## Design Goals

On the technical side, Cronos POS Chain has the following design goals:

1. **"Security"**: robust and well-understood primitives and implementation are favoured
2. **"Scalability"**: parts that hinder overall latency, throughput, lightweight client support, etc. should be mitigated
3. **"Multi-party"**: the system should permit multi-party operation; anything that puts trust in a single party should be opt-in
4. **"Long-term operation"**: there needs to be a leeway for backward- and forwards-compatibility etc.
5. **"Developer ecosystem"**: external developers can easily work with Chain, regardless of their used programming language; better support for DeFi use cases, e.g., support cross-chain asset transfers and communications.


> This is adapted from gitme1-ym(https://github.com/github/docs/pull/42419#issue-3821870949)

#### TL;DR:

Messages must be matched by the following regex:

``` js
/^(revert: )?(feat|fix|polish|docs|style|refactor|perf|test|workflow|ci|chore|types)(\(.+\))?: .{1,50}/
```

#### Examples

Appears under "Features" header, `compiler` subheader:

```
feat(compiler): add 'comments' option
```

Appears under "Bug Fixes" header, `v-model` subheader, with a link to issue #28:

```
fix(v-model): handle events on blur

close #28
```

Appears under "Performance Improvements" header, and under "Breaking Changes" with the breaking change explanation:

```
perf(core): improve vdom diffing by removing 'foo' option

BREAKING CHANGE: The 'foo' option has been removed.
```

The following commit and commit `667ecc1` do not appear in the changelog if they are under the same release. If not, the revert commit appears under the "Reverts" header.

```
revert: feat(compiler): add 'comments' option

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.
```

### Full Message Format

A commit message consists of a **header**, **body** and **footer**.  The header has a **type**, **scope** and **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

### Revert

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body, it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

If the prefix is `feat`, `fix` or `perf`, it will appear in the changelog. However, if there is any [BREAKING CHANGE](#footer), the commit will always appear in the changelog.

Other prefixes are up to your discretion. Suggested prefixes are `docs`, `chore`, `style`, `refactor`, and `test` for non-changelog related tasks.

### Scope

The scope could be anything specifying the place of the commit change. For example `core`, `compiler`, `ssr`, `v-model`, `transition` etc...

### Subject

The subject contains a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer

The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
