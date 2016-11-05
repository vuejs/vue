let latestNodeId = 1

function TextNode (text) {
  this.instanceId = ''
  this.nodeId = latestNodeId++
  this.parentNode = null
  this.nodeType = 3
  this.text = text
}

export default {
  TextNode,
  instances: {},
  modules: {},
  components: {}
}
