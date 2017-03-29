/* @flow */

export type ParsedTemplate = {
  head: string;
  neck: string;
  waist: string;
  tail: string;
};

export function parseTemplate (
  template: string,
  contentPlaceholder?: string = '<!--vue-ssr-outlet-->'
): ParsedTemplate {
  if (typeof template === 'object') {
    return template
  }

  let i = template.indexOf('</head>')
  const j = template.indexOf(contentPlaceholder)

  if (j < 0) {
    throw new Error(`Content placeholder not found in template.`)
  }

  if (i < 0) {
    i = template.indexOf('<body>')
    if (i < 0) {
      i = j
    }
  }

  let waist = ''
  let tail = template.slice(j + contentPlaceholder.length)
  let k = tail.indexOf('</script>')
  if (k > 0) {
    k += '</script>'.length
    waist = tail.slice(0, k)
    tail = tail.slice(k)
  }

  return {
    head: template.slice(0, i),
    neck: template.slice(i, j),
    waist,
    tail
  }
}
