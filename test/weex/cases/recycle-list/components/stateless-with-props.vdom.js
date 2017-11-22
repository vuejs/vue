({
  type: 'recycle-list',
  attr: {
    listData: [
      { type: 'A', poster: 'xx', title: 'x' },
      { type: 'A', poster: 'yy', title: 'y' }
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
        '@isComponentRoot': true,
        '@componentProps': {
          imageUrl: { '@binding': 'item.poster' },
          title: { '@binding': 'item.title' }
        }
      },
      children: [{
        type: 'image',
        style: {
          width: '750px',
          height: '1000px'
        },
        attr: {
          src: { '@binding': 'imageUrl' }
        }
      }, {
        type: 'text',
        style: {
          fontSize: '80px',
          textAlign: 'center',
          color: '#E95659'
        },
        attr: {
          value: { '@binding': 'title' }
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
