/* @flow */
import Vue from 'core/index'
import {getTrustedTypes, isTrustedValue} from 'shared/util'

type TrustedTypePolicy = {
  // value returned is actually an object with toString method returning the wrapped value
  createHTML: (value: any) => string;
};

let policy: ?TrustedTypePolicy
// we need this function to clear the policy in tests
Vue.prototype.$clearTrustedTypesPolicy = function() {
  policy = undefined
}

export function maybeCreateDangerousSvgHTML(value: any): string {
  // create policy lazily to simplify testing
  const tt = getTrustedTypes()
  if (tt && !policy) {
    policy = tt.createPolicy(Vue.config.trustedTypesPolicyName, {createHTML: (s) => s});
  }

  if (!tt) return `<svg>${value}</svg>`;
  else if (!isTrustedValue(value)) throw new Error('Expected svg innerHTML to be TrustedHTML!');
  // flow complains 'policy' may be undefined
  else return (policy: any).createHTML(`<svg>${value}</svg>`);
}

export function getTrustedShouldDecodeInnerHTML(href: boolean): string {
  return href ? `<a href="\n"/>` : `<div a="\n"/>`
}