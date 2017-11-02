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
          '@index': 'index',
          '@alias': 'object'
        }
      },
      children: [{
        type: 'text',
        attr: {
          value: {
            '@binding': 'object.name'
          }
        }
      }, {
        type: 'text',
        attr: {
          '[[repeat]]': {
            '@expression': 'object',
            '@alias': 'v',
            '@key': 'k',
            '@index': 'i'
          },
          value: {
            '@binding': 'v'
          }
        }
      }]
    }]
  }]
})
