/* @flow */

const decoder = document.createElement('div')

export function decodeHTML (html: string, asAttribute?: boolean): string {
  if (asAttribute) {
    html = html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  decoder.innerHTML = html
  return decoder.textContent
}
