({
  type: 'recycle-list',
  attr: {
    append: 'tree',
    listData: [
      { type: 'A' },
      { type: 'B', poster: 'yy', title: 'y' },
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
        attr: { value: 'BANNER' }
      }]
    }, {
      type: 'text',
      attr: { value: '----' }
    }, {
      type: 'div',
      attr: {
        '@isComponentRoot': true,
        '@componentProps': {}
      },
      classList: ['footer'],
      children: [{
        type: 'text',
        classList: ['copyright'],
        attr: { value: 'All rights reserved.' }
      }]
    }]
  }, {
    type: 'cell-slot',
    attr: { append: 'tree', case: 'B' },
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
        attr: { value: 'BANNER' }
      }]
    }, {
      type: 'div',
      attr: {
        '@isComponentRoot': true,
        '@componentProps': {
          imageUrl: { '@binding': 'item.poster' },
          title: { '@binding': 'item.title' }
        }
      },
      children: [{
        type: 'image',
        classList: ['image'],
        attr: {
          src: { '@binding': 'imageUrl' }
        }
      }, {
        type: 'text',
        classList: ['title'],
        attr: {
          value: { '@binding': 'title' }
        }
      }]
    }]
  }]
})
