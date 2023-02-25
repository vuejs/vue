import { parse, ParserPlugin } from '@babel/parser'
import MagicString from 'magic-string'

const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)(?:as)?(\s*)default/s
const exportDefaultClassRE =
  /((?:^|\n|;)\s*)export\s+default\s+class\s+([\w$]+)/

/**
 * Utility for rewriting `export default` in a script block into a variable
 * declaration so that we can inject things into it
 */
export function rewriteDefault(
  input: string,
  as: string,
  parserPlugins?: ParserPlugin[]
): string {
  if (!hasDefaultExport(input)) {
    return input + `\nconst ${as} = {}`
  }

  let replaced: string | undefined

  const classMatch = input.match(exportDefaultClassRE)
  if (classMatch) {
    replaced =
      input.replace(exportDefaultClassRE, '$1class $2') +
      `\nconst ${as} = ${classMatch[2]}`
  } else {
    replaced = input.replace(defaultExportRE, `$1const ${as} =`)
  }
  if (!hasDefaultExport(replaced)) {
    return replaced
  }

  // if the script somehow still contains `default export`, it probably has
  // multi-line comments or template strings. fallback to a full parse.
  const s = new MagicString(input)
  const ast = parse(input, {
    sourceType: 'module',
    plugins: parserPlugins
  }).program.body
  ast.forEach(node => {
    if (node.type === 'ExportDefaultDeclaration') {
      if (node.declaration.type === 'ClassDeclaration') {
        s.overwrite(node.start!, node.declaration.id.start!, `class `)
        s.append(`\nconst ${as} = ${node.declaration.id.name}`)
      } else {
        s.overwrite(node.start!, node.declaration.start!, `const ${as} = `)
      }
    }
    if (node.type === 'ExportNamedDeclaration') {
      for (const specifier of node.specifiers) {
        if (
          specifier.type === 'ExportSpecifier' &&
          specifier.exported.type === 'Identifier' &&
          specifier.exported.name === 'default'
        ) {
          if (node.source) {
            if (specifier.local.name === 'default') {
              const end = specifierEnd(input, specifier.local.end!, node.end)
              s.prepend(
                `import { default as __VUE_DEFAULT__ } from '${node.source.value}'\n`
              )
              s.overwrite(specifier.start!, end, ``)
              s.append(`\nconst ${as} = __VUE_DEFAULT__`)
              continue
            } else {
              const end = specifierEnd(input, specifier.exported.end!, node.end)
              s.prepend(
                `import { ${input.slice(
                  specifier.local.start!,
                  specifier.local.end!
                )} } from '${node.source.value}'\n`
              )
              s.overwrite(specifier.start!, end, ``)
              s.append(`\nconst ${as} = ${specifier.local.name}`)
              continue
            }
          }
          const end = specifierEnd(input, specifier.end!, node.end)
          s.overwrite(specifier.start!, end, ``)
          s.append(`\nconst ${as} = ${specifier.local.name}`)
        }
      }
    }
  })
  return s.toString()
}

export function hasDefaultExport(input: string): boolean {
  return defaultExportRE.test(input) || namedDefaultExportRE.test(input)
}

function specifierEnd(
  input: string,
  end: number,
  nodeEnd: number | undefined | null
) {
  // export { default   , foo } ...
  let hasCommas = false
  let oldEnd = end
  while (end < nodeEnd!) {
    if (/\s/.test(input.charAt(end))) {
      end++
    } else if (input.charAt(end) === ',') {
      end++
      hasCommas = true
      break
    } else if (input.charAt(end) === '}') {
      break
    }
  }
  return hasCommas ? end : oldEnd
}
