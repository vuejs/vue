/* @flow */

const validDivisionCharRE = /[\w).+\-_$\]]/

export function parseFilters (exp: string): string {
  let curly = 0
  let square = 0
  let paren = 0
  let lastFilterIndex = 0
  let c, i, expression, filters

  for (i = 0; i < exp.length; i++) {
    c = exp.charCodeAt(i)
    if (
      // a pipe that separates filters is a
      c === 0x7C && // pipe
      // but not a ||:
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      // and not inside any curlies, squares or parens.
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: case 0x27: case 0x60:          // ", ' or `
          // find string end.
          i = seek(exp, i + 1, c); break
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }

      if (c === 0x2f) { // /
        // a '/' can be a division or a regex expression.
        // they can be distinguished by what is preceding.
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        // if there was no preceding character
        // or the preceding character was not a character
        // that is allowed to precede division
        // it is a regex expression.
        if (!p || !validDivisionCharRE.test(p)) {
          // find matching '/' for end.
          i = seek(exp, i + 1, 0x2f)
        }
      }
    }
  }

  if (expression === undefined) {
    lastFilterIndex = i + 1
    expression = exp.slice(0, i).trim()
  } else {
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

function seek (string: string, start: number, forchar: number): number {
  let c, i
  for (i = start; i <= string.length; i++) {
    c = string.charCodeAt(i)
    if (c === forchar) {
      // found position of next matching character.
      return i
    }
    if (c === 0x5C) {
      // skip next character as it is escaped.
      i++
    }
  }
  return i
}

function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}
