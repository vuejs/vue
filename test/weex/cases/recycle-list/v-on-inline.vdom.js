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
      type: 'text',
      event: ['click', {
        type: 'longpress',
        params: [{ '@binding': 'item.key' }]
      }]
    }, {
      type: 'text',
      event: [{
        type: 'appear',
        params: [
          { '@binding': 'item.index' },
          { '@binding': 'item.type' }
        ]
      }],
      attr: { value: 'Button' }
    }, {
      type: 'text',
      event: [{ type: 'disappear' }],
      attr: { value: 'Tips' }
    }]
  }]
})
