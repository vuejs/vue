/* @flow */

/**
 * turn "1000n" into "BigInt(1000)"
 * and then turn "BigInt(1000)" into "_bigInt(1000)"
 * 
 * by the way, if we meet variable like "l18n"
 * we will change "l18n" to "l18@"
 * after we finish parse bigint
 * we will change "l18@" back to "l18n"
 * @param {*} exp 
 */
export function parseBigint(exp: string): string {
  let expression = exp
    .replace(/([a-zA-Z_$]+[0-9]+)n/g, '$1@')
    .replace(/([0-9]+)n/g, 'BigInt($1)')
    .replace(/([a-zA-Z_$]+[0-9]+)@/g, '$1n')
    .replace(/BigInt\(/g, '_bigInt(')
  return expression
}