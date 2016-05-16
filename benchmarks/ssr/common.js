'use strict'

const compiler = require('../../dist/compiler.js')
const self = (global || root)

self.performance = {
  now: function () {
    var hrtime = process.hrtime()
    return ((hrtime[0] * 1000000 + hrtime[1] / 1000) / 1000)
  }
}

function generateGrid (rowCount, columnCount) {
  var grid = []

  for (var r = 0; r < rowCount; r++) {
    var row = { id: r, items: [] }
    for (var c = 0; c < columnCount; c++) {
      row.items.push({ id: (r + '-' + c) })
    }
    grid.push(row)
  }

  return grid
}

const gridData = generateGrid(1000, 10)

var gridComponent = {
  template: '<div><h1>{{ Math.random() }}</h1><my-table></my-table></div>',
  components: {
    myTable: {
      data: function () {
        return {
          grid: gridData
        }
      },
      // template: '<table><tr v-for="row in grid"><th>123</th><td v-for="item in row.items">{{ item.id }}</td></tr></table>',
      template: '<table width="100%" cellspacing="2"><row v-for="row in grid" :row="row"></row></table>',
      components: {
        row: {
          props: ['row'],
          template: '<tr><th>{{ Math.random() }}</th><column v-for="item in row.items"></column></tr>',
          components: {
            column: {
              template: '<td class="item">' +
                // 25 plain elements for each cell
                '<ul class="yoyo">' +
                  '<li class="hihi" v-for="i in 5">' +
                    '<span v-for="i in 5">fsefs</span>' +
                    '</li>' +
                '</ul>' +
              '</td>'
            }
          }
        }
      }
    }
  }
}

function createCompiledOptions (options) {
  const res = compiler.compileToFunctions(options.template, {
    preserveWhitespace: false
  })
  Object.assign(options, res)
  delete options.template
  if (options.components) {
    const keys = Object.keys(options.components)
    let total = keys.length
    while (total) {
      const name = keys[total - 1]
      options.components[name] = createCompiledOptions(options.components[name])
      total--
    }
  }
  return options
}

module.exports = createCompiledOptions(gridComponent)
