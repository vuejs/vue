({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A' },
      { type: 'A' }
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
          message: 'No binding'
        }
      },
      children: [{
        type: 'text',
        classList: ['output'],
        attr: {
          value: { '@binding': 'output' }
        }
      }, {
        type: 'input',
        event: ['input'],
        classList: ['input'],
        attr: {
          type: 'text',
          value: 'No binding'
        }
      }]
    }]
  }]
})
