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
        '[[match]]': 'item.sourceA',
        src: { '@binding': 'item.sourceA' }
      }
    }, {
      type: 'image',
      attr: {
        '[[match]]': '!(item.sourceA) && (item.sourceB)',
        src: { '@binding': 'item.sourceB' }
      }
    }, {
      type: 'image',
      attr: {
        '[[match]]': '!(!(item.sourceA) && (item.sourceB))',
        src: { '@binding': 'item.placeholder' }
      }
    }]
  }]
})
