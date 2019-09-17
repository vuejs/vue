/* @flow */
import Vue from 'core/index'
import {getTrustedTypes, isTrustedValue} from 'shared/util'

type TrustedTypePolicy = {
  // value returned is actually an object with toString method returning the wrapped value
  createHTML: (value: any) => string;
};

let policy: ?TrustedTypePolicy
// create policy lazily to simplify testing
function getOrCreatePolicy() {
  const tt = getTrustedTypes()
  if (tt && !policy) {
    policy = tt.createPolicy(Vue.config.trustedTypesPolicyName, {createHTML: (s) => s});
  }

  return policy
}

if (process.env.NODE_ENV !== 'production') {
  // we need this function to clear the policy in tests
  Vue.prototype.$clearTrustedTypesPolicy = function() {
    policy = undefined
  }
}

export function maybeCreateDangerousSvgHTML(value: any): string {
  const tt = getTrustedTypes()

  if (!tt || !isTrustedValue(value)) return `<svg>${value}</svg>`;
  // flow complains that 'getOrCreatePolicy()' might return null
  else return (getOrCreatePolicy(): any).createHTML(`<svg>${value}</svg>`);
}

export function getTrustedShouldDecodeInnerHTML(href: boolean): string {
  const html = href ? `<a href="\n"/>` : `<div a="\n"/>`;
  const p = getOrCreatePolicy()
  if (!p) return html;
  else return p.createHTML(html);
}