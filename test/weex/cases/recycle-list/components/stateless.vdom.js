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
      // not supported yet
      // attr: {
      //   '@isComponentRoot': true,
      //   '@componentProps': {}
      // },
      // style: {
      //   height: '120px',
      //   justifyContent: 'center',
      //   alignItems: 'center',
      //   backgroundColor: 'rgb(162, 217, 192)'
      // },
      children: [{
        type: 'text',
        // style: {
        //   fontWeight: 'bold',
        //   color: '#41B883',
        //   fontSize: '60px'
        // },
        attr: {
          value: 'BANNER'
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
