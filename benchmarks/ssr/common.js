'use strict'

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

const five = [0, 1, 2, 3, 4]

module.exports = {
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
          // template: '<tr><th>{{ Math.random() }}</th><column v-for="item in row.items"></column></tr>',
          render (h) {
            return h('tr', [
              new TextNode(1, [
                new TextNode(2),
                ...this.row.items.map(item => h('column'))
              ])
            ])
          },
          components: {
            column: {
              render (h) {
                return h('td', { class: 'item' }, [
                  new TextNode(4,
                    five.map(() => new TextNode(5,
                      five.map(() => new TextNode(6, [new TextNode(7)])))
                    )
                  )
                ])
              }
              // template: '<td class="item">' +
              //   // 25 plain elements for each cell
              //   '<ul class="yoyo">' +
              //     '<li class="hihi" v-for="i in 5">' +
              //       '<span v-for="i in 5">fsefs</span>' +
              //       '</li>' +
              //   '</ul>' +
              // '</td>'
            }
          }
        }
      }
    }
  }
}

const renderFns = [
  { open: () => `<tr>`, close: `</tr>` },
  { open: () => `<th>`, close: `</th>` },
  { open: () => Math.random() },
  { open: () => `<td class="item">`, close: `</td>` },
  { open: () => `<ul class="yoyo">`, close: `</ul>` },
  { open: () => `<li class="hihi">`, close: `</li>` },
  { open: () => `<span>`, close: `</span>` },
  { open: () => `fsefs` }
]

function TextNode (id, children) {
  this.isTextNode = true
  this.open = renderFns[id].open
  this.close = renderFns[id].close
  this.children = children
}
