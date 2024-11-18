const range = 2

export function generateCodeFrame(
  source: string,
  start: number = 0,
  end: number = source.length
): string {
  const lines = source.split(/\r?\n/)
  let count = 0
  const res: string[] = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j < lines.length && (j <= i + range || end > count); j++) {
        if (j < 0) continue
        res.push(
          `${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`
        )
        const lineLength = lines[j].length
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
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat(str: string, n: number) {
  let result = ''
  if (n > 0) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-line
      if (n & 1) result += str
      n >>>= 1
      if (n <= 0) break
      str += str
    }
  }
  return result
}
