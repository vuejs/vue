({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A', number: 24 },
      { type: 'A', number: 42 }
    ],
    switch: 'type',
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { append: 'tree', case: 'A' },
    children: [{
      type: 'div',
      attr: {
        '@isComponentRoot': true,
        '@componentProps': {
          start: { '@binding': 'item.number' }
        }
      },
      children: [{
        type: 'text',
        classList: ['output'],
        attr: {
          value: { '@binding': 'count' } // need confirm
        }
      }, {
        type: 'text',
        event: ['click'],
        classList: ['button'],
        attr: { value: '+' }
      }]
    }, {
      type: 'text',
      attr: { value: 'other' }
    }]
  }]
})
