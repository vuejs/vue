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
        '@componentProps': {}
      },
      classList: ['banner'],
      children: [{
        type: 'text',
        classList: ['title'],
        attr: {
          value: 'BANNER'
        }
      }]
    }, {
      type: 'text',
      attr: {
        value: 'content'
      }
    }]
  }]
})
