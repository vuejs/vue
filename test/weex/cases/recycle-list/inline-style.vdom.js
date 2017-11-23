({
  type: 'recycle-list',
  attr: {
    listData: [
      { type: 'A', color: '#606060' },
      { type: 'A', color: '#E5E5E5' }
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
      style: {
        fontSize: '100px',
        color: { '@binding': 'item.color' }
      },
      attr: {
        value: 'content'
      }
    }]
  }]
})
