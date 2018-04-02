/* @flow */

const CHAR_PIPE = 0x7C
const CHAR_DOUBLE_QUOTE = 0x22
const CHAR_SINGLE_QUOTE = 0x27
const CHAR_BACKTICK = 0x60
const CHAR_PARENTHESIS_OPEN = 0x28
const CHAR_PARENTHESIS_CLOSE = 0x29
const CHAR_BRACKET_OPEN = 0x5B
const CHAR_BRACKET_CLOSE = 0x5D
const CHAR_CURLY_OPEN = 0x7B
const CHAR_CURLY_CLOSE = 0x7D
const CHAR_FORWARD_SLASH = 0x2f
const CHAR_BACK_SLASH = 0x5C

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
      // a pipe that separates filters is a pipe
      c === CHAR_PIPE &&
      // but not a ||:
      exp.charCodeAt(i + 1) !== CHAR_PIPE &&
      exp.charCodeAt(i - 1) !== CHAR_PIPE &&
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
        case CHAR_DOUBLE_QUOTE:
        case CHAR_SINGLE_QUOTE:
        case CHAR_BACKTICK:
          // find string end.
          i = seek(exp, i + 1, c); break
        case CHAR_PARENTHESIS_OPEN: paren++; break
        case CHAR_PARENTHESIS_CLOSE: paren--; break
        case CHAR_BRACKET_OPEN: square++; break
        case CHAR_BRACKET_CLOSE: square--; break
        case CHAR_CURLY_OPEN: curly++; break
        case CHAR_CURLY_CLOSE: curly--; break
      }

      if (c === CHAR_FORWARD_SLASH) {
        // a '/' can be a division or a regex expression.
        // they can be distinguished by what is preceding.
        let p
        // find first non-whitespace prev char
        for (let j = i - 1; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        // if there was no preceding character
        // or the preceding character was not a character
        // that is allowed to precede division
        // it is a regex expression.
        if (!p || !validDivisionCharRE.test(p)) {
          // find matching '/' for end.
          i = seek(exp, i + 1, CHAR_FORWARD_SLASH)
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
    if (c === CHAR_BACK_SLASH) {
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
