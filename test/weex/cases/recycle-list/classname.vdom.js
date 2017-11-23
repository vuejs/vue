({
  type: 'recycle-list',
  attr: {
    listData: [
      { type: 'A', color: 'red' },
      { type: 'A', color: 'blue' }
    ],
    templateKey: 'type',
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { templateType: 'A' },
    style: {
      backgroundColor: '#FF6600'
    },
    children: [{
      type: 'text',
      attr: {
        // not supported yet
        // classList: ['text', { '@binding': 'item.color' }],
        value: 'content'
      }
    }]
  }]
})
