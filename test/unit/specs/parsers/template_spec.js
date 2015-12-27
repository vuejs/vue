var templateParser = require('src/parsers/template')
var parse = templateParser.parseTemplate
var testString = '<div>hello</div><p class="test">world</p>'

describe('Template Parser', function () {

  it('should return same if argument is already a fragment', function () {
    var frag = document.createDocumentFragment()
    var res = parse(frag)
    expect(res).toBe(frag)
  })

  it('should return content if argument is a valid template node', function () {
    var templateNode = document.createElement('template')
    if (!templateNode.content) {
      // mock the content
      templateNode.content = document.createDocumentFragment()
    }
    var res = parse(templateNode)
    expect(res).toBe(templateNode.content)
  })

  it('should parse if argument is a template string', function () {
    var res = parse(testString)
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(2)
    expect(res.querySelector('.test').textContent).toBe('world')
  })

  it('should work if the template string doesn\'t contain tags', function () {
    var res = parse('hello!')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.nodeType).toBe(3) // Text node
  })

  it('should handle string that contains html entities', function () {
    var res = parse('hi&lt;hi')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.nodeValue).toBe('hi<hi')
    // #1330
    res = parse('hello &#x2F; hello')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.nodeValue).toBe('hello / hello')
    // #2021
    res = parse('&#xe604;')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.nodeValue).toBe('')
  })

  it('should parse textContent if argument is a script node', function () {
    var node = document.createElement('script')
    node.textContent = testString
    var res = parse(node)
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(2)
    expect(res.querySelector('.test').textContent).toBe('world')
  })

  it('should parse innerHTML if argument is a normal node', function () {
    var node = document.createElement('div')
    node.innerHTML = testString
    var res = parse(node)
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(2)
    expect(res.querySelector('.test').textContent).toBe('world')
  })

  it('should retrieve and parse if argument is an id selector', function () {
    var node = document.createElement('script')
    node.setAttribute('id', 'template-test')
    node.setAttribute('type', 'x/template')
    node.textContent = testString
    document.head.appendChild(node)
    var res = parse('#template-test')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(2)
    expect(res.querySelector('.test').textContent).toBe('world')
    document.head.removeChild(node)
  })

  it('should work for table elements', function () {
    var res = parse('<td>hello</td>')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.tagName).toBe('TD')
    expect(res.firstChild.textContent).toBe('hello')
  })

  it('should work for option elements', function () {
    var res = parse('<option>hello</option>')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.tagName).toBe('OPTION')
    expect(res.firstChild.textContent).toBe('hello')
  })

  it('should work for svg elements', function () {
    var res = parse('<circle></circle>')
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.childNodes.length).toBe(1)
    // SVG tagNames should be lowercase because they are XML nodes not HTML
    expect(res.firstChild.tagName).toBe('circle')
    expect(res.firstChild.namespaceURI).toBe('http://www.w3.org/2000/svg')
  })

  it('should cache template strings', function () {
    var res1 = parse(testString)
    var res2 = parse(testString)
    expect(res1).toBe(res2)
  })

  it('should clone', function () {
    var res1 = parse(testString, true)
    var res2 = parse(testString, true)
    expect(res1).not.toBe(res2)
  })

  it('should cache id selectors', function () {
    var node = document.createElement('script')
    node.setAttribute('id', 'template-test')
    node.setAttribute('type', 'x/template')
    node.textContent = '<div>never seen before content</div>'
    document.head.appendChild(node)
    var res1 = parse('#template-test')
    var res2 = parse('#template-test')
    expect(res1).toBe(res2)
    document.head.removeChild(node)
  })

  it('should be able to not use id selectors', function () {
    var res = parse('#hi', false, true)
    expect(res instanceof DocumentFragment).toBeTruthy()
    expect(res.firstChild.nodeValue).toBe('#hi')
  })

  it('should deal with Safari template clone bug', function () {
    var a = document.createElement('div')
    a.innerHTML = '<template>1</template>'
    var c = templateParser.cloneNode(a)
    expect(c.firstChild.innerHTML).toBe('1')
  })

  it('should deal with Safari template clone bug even when nested', function () {
    var a = document.createElement('div')
    a.innerHTML = '<template><div>1</div><template>2</template></template>'
    var c = templateParser.cloneNode(a)
    expect(c.firstChild.innerHTML).toBe('<div>1</div><template>2</template>')
  })

  it('should deal with IE textarea clone bug', function () {
    var t = document.createElement('textarea')
    t.placeholder = 't'
    var c = templateParser.cloneNode(t)
    expect(c.value).toBe('')
  })

  it('should trim empty text nodes', function () {
    // string
    var res = parse('    <p>test</p>    ')
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.tagName).toBe('P')
    // nodes
    var el = document.createElement('div')
    el.innerHTML = '<template>    <p>test</p>    </template>'
    res = parse(el.children[0])
    expect(res.childNodes.length).toBe(1)
    expect(res.firstChild.tagName).toBe('P')
  })
})
