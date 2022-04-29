({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A' },
      { type: 'A' }
    ],
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { append: 'tree' },
    children: [{
      type: 'text',
      attr: {
        '[[once]]': true,
        value: { '@binding': 'item.type' }
      }
    }]
  }]
})
