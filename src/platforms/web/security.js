/* @flow */

type TrustedTypePolicy = {
  // value returned is actually an object with toString method returning the wrapped value
  createHTML: (value: any) => string;
};

let policy: TrustedTypePolicy
export function convertToTrustedType(value: any) {
  // create policy lazily to simplify testing
  const tt = getTrustedTypes()
  if (tt && !policy) {
    policy = tt.createPolicy('vue', {createHTML: (s) => s});
  }

  if (!tt) return value;
  else return policy.createHTML(value);
}

export function getTrustedTypes() {
  // TrustedTypes have been renamed to trustedTypes https://github.com/WICG/trusted-types/issues/177
  return window.trustedTypes || window.TrustedTypes;
}
