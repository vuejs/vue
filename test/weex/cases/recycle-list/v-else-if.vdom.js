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
