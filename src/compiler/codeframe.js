/* @flow */

const range = 2

export function generateCodeFrame (
  source: string,
  start: number = 0,
  end?: number
): string {
  const lines = source.split(/\n/)
    .map(x => x[x.length - 1] === '\r' ? { line: x.substr(0, x.length - 1), increment: 2 } : { line: x, increment: 1})
  if (typeof end === 'undefined') {
    end = lines.reduce((s, x) => s + x.line.length + x.increment, 0)
  }
  let count = 0
  const res = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].line.length + lines[i].increment
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0) continue
        if (j >= lines.length) break
        res.push(`${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j].line}`)
        const lineLength = lines[j].line.length
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1
          const length = end > count ? lineLength - pad : end - start
          res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length))
        } else if (j > i) {
          if (end > count) {
            const length = Math.min(end - count, lineLength)
            res.push(`   |  ` + repeat(`^`, length))
          }
          count += lineLength + lines[j].increment
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat (str, n) {
  let result = ''
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) result += str
      n >>>= 1
      if (n <= 0) break
      str += str
    }
  }
  return result
}
