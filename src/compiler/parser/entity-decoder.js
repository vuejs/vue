/* @flow */

const decoder = document.createElement('div')

export function decodeHTML (html: string): string {
  decoder.innerHTML = html
  return decoder.textContent
}
