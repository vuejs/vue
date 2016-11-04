/* @flow */

const decoder = document.createElement('div')

export function decode (html: string): string {
  decoder.innerHTML = html
  return decoder.textContent
}
