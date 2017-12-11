({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A' },
      { type: 'A' }
    ],
    templateKey: 'type',
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { append: 'tree', templateType: 'A' },
    children: [{
      type: 'text',
      event: ['click', 'longpress'],
      attr: { value: 'A' }
    }, {
      type: 'text',
      event: ['touchend'],
      attr: { value: 'B' }
    }]
  }]
})
