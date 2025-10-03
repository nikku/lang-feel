# Changelog

All notable changes to [lang-feel](https://github.com/nikku/lang-feel) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 2.4.0

* `DEPS`: update to `@codemirror/autocomplete@6.19.0`
* `DEPS`: update to `@codemirror/language@6.11.3`
* `DEPS`: update to `lezer-feel@1.9.0`

## 2.3.1

* `FIX`: require closing `"` on string literals
* `DEPS`: update to `lezer-feel@1.7.1`

## 2.3.0

* `FEAT`: complete `null`, `false`, and `true` tokens
* `FEAT`: improve completion in various cases
* `DEPS`: update to `lezer-feel@1.7.0`

## 2.2.0

* `FEAT`: allow to specify `parserDialect` ([#13](https://github.com/nikku/lang-feel/issues/13))
* `DEPS`: update to `lezer-feel@1.3.0`

## 2.1.1

* `FIX`: do not complete snippets inside `PathExpression`

## 2.1.0

* `FEAT`: attach language `name` ([`51dff22`](https://github.com/nikku/lang-feel/commit/51dff227b142f2a34283c919bb3636a1d484bb85))
* `CHORE`: use contextual language to bind autocompletion tokens ([`9a759a0`](https://github.com/nikku/lang-feel/commit/9a759a0d4d6bb12e341884a3c2e8a81b6bff8d71))
* `DEPS`: update `codemirror*` deps
* `DEPS`: update to `lezer-feel@1.2.9`

## 2.0.0

* `FEAT`: make keyword completions contextual
* `FEAT`: allow to override completions
* `FEAT`: expose many onboard utilities for easier customizing

## 1.1.0

* `DEPS`: update to `lezer-feel@1.2.0`

## 1.0.0

* `DEPS`: update `lezer`
* `DEPS`: update to `lezer-feel@1.0.0`

### Breaking Changes

* Parses single expression rather than expressions

## 0.5.0

* `DEPS`: update to `lezer-feel@0.17.0`

## 0.4.0

* `FEAT`: allow folding of parenthesis

## 0.3.2

* `FIX`: continue indent in parenthesis and function invocation

## 0.3.1

* `FIX`: remove wrong `if` snippet

## 0.3.0

* `DEPS`: bump to `lezer-feel@0.17.0`
* `DEPS`: update `codemirror`

## 0.2.0

* `DEPS`: bump to `lezer-feel@0.16.0`

## 0.1.0

* `DEPS`: bump to `lezer-feel@0.15.0`

## 0.0.3

* `FIX`: don't complete in `StringLiteral`

## 0.0.2

* `FEAT`: unify snippets
* `FIX`: don't double-suggest keyword completions

## 0.0.1

_Initial version._
