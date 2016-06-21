/* @flow */

const splitRE = /\r?\n/g
const emptyRE = /^\s*$/
const needFixRE = /^(\r?\n)*[\t\s]/

export default function deindent (str: string): string {
  if (!needFixRE.test(str)) {
    return str
  }
  const lines = str.split(splitRE)
  let min = Infinity
  let type, cur, c
  for (let i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!emptyRE.test(line)) {
      if (!type) {
        c = line.charAt(0)
        if (c === ' ' || c === '\t') {
          type = c
          cur = count(line, type)
          if (cur < min) {
            min = cur
          }
        } else {
          return str
        }
      } else {
        cur = count(line, type)
        if (cur < min) {
          min = cur
        }
      }
    }
  }
  return lines.map(line => line.slice(min)).join('\n')
}

function count (line: string, type: string): number {
  var i = 0
  while (line.charAt(i) === type) {
    i++
  }
  return i
}
