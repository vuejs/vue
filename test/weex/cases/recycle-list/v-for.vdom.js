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
      type: 'div',
      attr: {
        '[[repeat]]': {
          '@expression': 'item.list',
          '@alias': 'panel'
        }
      },
      children: [{
        type: 'text',
        attr: {
          value: {
            '@binding': 'panel.label'
          }
        }
      }]
    }]
  }]
})
