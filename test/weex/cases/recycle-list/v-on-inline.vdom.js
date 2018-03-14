({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A' },
      { type: 'A' }
    ],
    index: 'i',
    switch: 'type',
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { append: 'tree', case: 'A' },
    children: [{
      type: 'text',
      event: ['click', {
        type: 'longpress',
        params: [{ '@binding': 'item.key' }]
      }]
    }, {
      type: 'text',
      event: [{
        type: 'appear',
        params: [
          { '@binding': 'item.index' },
          { '@binding': 'item.type' }
        ]
      }],
      attr: { value: 'Button' }
    }, {
      type: 'text',
      event: [{ type: 'disappear' }],
      attr: { value: 'Tips' }
    }, {
      type: 'text',
      event: [{
        type: 'swipe',
        params: [
          { '@binding': 'i' }
        ]
      }],
      attr: { value: 'Inc' }
    }]
  }]
})
