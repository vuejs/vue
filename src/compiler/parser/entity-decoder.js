const decoder = document.createElement('div')

export function decodeHTML (html) {
  decoder.innerHTML = html
  return decoder.textContent
}
