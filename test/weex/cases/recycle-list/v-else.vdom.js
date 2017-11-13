({
  type: 'recycle-list',
  attr: {
    listData: [
      { type: 'A' },
      { type: 'A' }
    ],
    templateKey: 'type',
    alias: 'item'
  },
  children: [{
    type: 'cell-slot',
    attr: { templateType: 'A' },
    children: [{
      type: 'image',
      attr: {
        '[[match]]': 'item.source',
        src: { '@binding': 'item.source' }
      }
    }, {
      type: 'image',
      attr: {
        '[[match]]': '!(item.source)',
        src: { '@binding': 'item.placeholder' }
      }
    }]
  }]
})
