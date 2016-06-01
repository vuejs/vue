import { patch } from 'web/runtime/patch'
import VNode from 'core/vdom/vnode'

function prop (name) {
  return obj => { return obj[name] }
}

function map (fn, list) {
  const ret = []
  for (let i = 0; i < list.length; i++) {
    ret[i] = fn(list[i])
  }
  return ret
}

function spanNum (n) {
  if (typeof n === 'string') {
    return new VNode('span', {}, undefined, n)
  } else {
    return new VNode('span', { key: n }, undefined, n.toString())
  }
}

function shuffle (array) {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // while there remain elements to shuffle...
  while (currentIndex !== 0) {
    // pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    // and swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }
  return array
}

const inner = prop('innerHTML')
const tag = prop('tagName')

describe('children', () => {
  let vnode0
  beforeEach(() => {
    vnode0 = new VNode('p', { attrs: { id: '1' }}, [createTextVNode('hello world')])
    patch(null, vnode0)
  })

  it('should appends elements', () => {
    const vnode1 = new VNode('p', {}, [1].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 3].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(1)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(3)
    expect(elm.children[1].innerHTML).toBe('2')
    expect(elm.children[2].innerHTML).toBe('3')
  })

  it('should prepends elements', () => {
    const vnode1 = new VNode('p', {}, [4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(2)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('should add elements in the middle', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(4)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('should add elements at begin and end', () => {
    const vnode1 = new VNode('p', {}, [2, 3, 4].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(3)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('should add children to parent with no children', () => {
    const vnode1 = new VNode('p', { key: 'p' })
    const vnode2 = new VNode('p', { key: 'p' }, [1, 2, 3].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(0)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['1', '2', '3'])
  })

  it('should remove all children from parent', () => {
    const vnode1 = new VNode('p', { key: 'p' }, [1, 2, 3].map(spanNum))
    const vnode2 = new VNode('p', { key: 'p' })
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['1', '2', '3'])
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(0)
  })

  it('should remove elements from the beginning', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [3, 4, 5].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(5)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['3', '4', '5'])
  })

  it('should removes elements from end', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 3].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(5)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(3)
    expect(elm.children[0].innerHTML).toBe('1')
    expect(elm.children[1].innerHTML).toBe('2')
    expect(elm.children[2].innerHTML).toBe('3')
  })

  it('should remove elements from the middle', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 2, 4, 5].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(5)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(4)
    expect(elm.children[0].innerHTML).toBe('1')
    expect(elm.children[1].innerHTML).toBe('2')
    expect(elm.children[2].innerHTML).toBe('4')
    expect(elm.children[3].innerHTML).toBe('5')
  })

  it('should moves element forward', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4].map(spanNum))
    const vnode2 = new VNode('p', {}, [2, 3, 1, 4].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(4)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(4)
    expect(elm.children[0].innerHTML).toBe('2')
    expect(elm.children[1].innerHTML).toBe('3')
    expect(elm.children[2].innerHTML).toBe('1')
    expect(elm.children[3].innerHTML).toBe('4')
  })

  it('should move elements to end', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3].map(spanNum))
    const vnode2 = new VNode('p', {}, [2, 3, 1].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(3)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(3)
    expect(elm.children[0].innerHTML).toBe('2')
    expect(elm.children[1].innerHTML).toBe('3')
    expect(elm.children[2].innerHTML).toBe('1')
  })

  it('should move element backwards', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4].map(spanNum))
    const vnode2 = new VNode('p', {}, [1, 4, 2, 3].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(4)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(4)
    expect(elm.children[0].innerHTML).toBe('1')
    expect(elm.children[1].innerHTML).toBe('4')
    expect(elm.children[2].innerHTML).toBe('2')
    expect(elm.children[3].innerHTML).toBe('3')
  })

  it('should swap first and last', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4].map(spanNum))
    const vnode2 = new VNode('p', {}, [4, 2, 3, 1].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(4)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(4)
    expect(elm.children[0].innerHTML).toBe('4')
    expect(elm.children[1].innerHTML).toBe('2')
    expect(elm.children[2].innerHTML).toBe('3')
    expect(elm.children[3].innerHTML).toBe('1')
  })

  it('should move to left and replace', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [4, 1, 2, 3, 6].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(5)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(5)
    expect(elm.children[0].innerHTML).toBe('4')
    expect(elm.children[1].innerHTML).toBe('1')
    expect(elm.children[2].innerHTML).toBe('2')
    expect(elm.children[3].innerHTML).toBe('3')
    expect(elm.children[4].innerHTML).toBe('6')
  })

  it('should move to left and leaves hold', () => {
    const vnode1 = new VNode('p', {}, [1, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [4, 6].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(3)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['4', '6'])
  })

  it('should handle moved and set to undefined element ending at the end', () => {
    const vnode1 = new VNode('p', {}, [2, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [4, 5, 3].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(3)
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(3)
    expect(elm.children[0].innerHTML).toBe('4')
    expect(elm.children[1].innerHTML).toBe('5')
    expect(elm.children[2].innerHTML).toBe('3')
  })

  it('should move a key in non-keyed nodes with a size up', () => {
    const vnode1 = new VNode('p', {}, [1, 'a', 'b', 'c'].map(spanNum))
    const vnode2 = new VNode('p', {}, ['d', 'a', 'b', 'c', 1, 'e'].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(4)
    expect(elm.textContent, '1abc')
    elm = patch(vnode1, vnode2)
    expect(elm.children.length).toBe(6)
    expect(elm.textContent, 'dabc1e')
  })

  it('should reverse element', () => {
    const vnode1 = new VNode('p', {}, [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum))
    const vnode2 = new VNode('p', {}, [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(8)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['8', '7', '6', '5', '4', '3', '2', '1'])
  })

  it('something', () => {
    const vnode1 = new VNode('p', {}, [0, 1, 2, 3, 4, 5].map(spanNum))
    const vnode2 = new VNode('p', {}, [4, 3, 2, 1, 5, 0].map(spanNum))
    let elm = patch(vnode0, vnode1)
    expect(elm.children.length).toBe(6)
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['4', '3', '2', '1', '5', '0'])
  })

  it('should handle random shuffle', () => {
    let n
    let i
    const arr = []
    const opacities = []
    const elms = 14
    const samples = 5
    function spanNumWithOpacity (n, o) {
      return new VNode('span', { key: n, style: { opacity: o }}, undefined, n.toString())
    }

    for (n = 0; n < elms; ++n) { arr[n] = n }
    for (n = 0; n < samples; ++n) {
      const vnode1 = new VNode('span', {}, arr.map(n => {
        return spanNumWithOpacity(n, '1')
      }))
      const shufArr = shuffle(arr.slice(0))
      let elm = patch(vnode0, vnode1)
      for (i = 0; i < elms; ++i) {
        expect(elm.children[i].innerHTML).toBe(i.toString())
        opacities[i] = Math.random().toFixed(5).toString()
      }
      const vnode2 = new VNode('span', {}, arr.map(n => {
        return spanNumWithOpacity(shufArr[n], opacities[n])
      }))
      elm = patch(vnode1, vnode2)
      for (i = 0; i < elms; ++i) {
        expect(elm.children[i].innerHTML).toBe(shufArr[i].toString())
        expect(opacities[i].indexOf(elm.children[i].style.opacity)).toBe(0)
      }
    }
  })

  it('should append elements with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'hello')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'hello'),
      new VNode('span', {}, undefined, 'world')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['hello'])
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['hello', 'world'])
  })

  it('should handle unmoved text nodes with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      createTextVNode('text'),
      new VNode('span', {}, undefined, 'hello')
    ])
    const vnode2 = new VNode('div', {}, [
      createTextVNode('text'),
      new VNode('span', {}, undefined, 'hello')
    ])
    let elm = patch(vnode0, vnode1)
    expect(elm.childNodes[0].textContent).toBe('text')
    elm = patch(vnode1, vnode2)
    expect(elm.childNodes[0].textContent).toBe('text')
  })

  it('should handle changing text children with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      createTextVNode('text'),
      new VNode('span', {}, undefined, 'hello')
    ])
    const vnode2 = new VNode('div', {}, [
      createTextVNode('text2'),
      new VNode('span', {}, undefined, 'hello')
    ])
    let elm = patch(vnode0, vnode1)
    expect(elm.childNodes[0].textContent).toBe('text')
    elm = patch(vnode1, vnode2)
    expect(elm.childNodes[0].textContent).toBe('text2')
  })

  it('should prepend element with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'world')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'hello'),
      new VNode('span', {}, undefined, 'world')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['world'])
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['hello', 'world'])
  })

  it('should prepend element of different tag type with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'world')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('div', {}, undefined, 'hello'),
      new VNode('span', {}, undefined, 'world')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['world'])
    elm = patch(vnode1, vnode2)
    expect(map(prop('tagName'), elm.children)).toEqual(['DIV', 'SPAN'])
    expect(map(inner, elm.children)).toEqual(['hello', 'world'])
  })

  it('should remove elements with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'one'),
      new VNode('span', {}, undefined, 'two'),
      new VNode('span', {}, undefined, 'three')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'one'),
      new VNode('span', {}, undefined, 'three')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['one', 'two', 'three'])
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['one', 'three'])
  })

  it('should remove a single text node with updating children without keys', () => {
    const vnode1 = new VNode('div', {}, undefined, 'one')
    const vnode2 = new VNode('div', {})
    let elm = patch(vnode0, vnode1)
    expect(elm.textContent).toBe('one')
    elm = patch(vnode1, vnode2)
    expect(elm.textContent).toBe('')
  })

  it('should remove a single text node when children are updated', () => {
    const vnode1 = new VNode('div', {}, undefined, 'one')
    const vnode2 = new VNode('div', {}, [
      new VNode('div', {}, undefined, 'two'),
      new VNode('span', {}, undefined, 'three')
    ])
    let elm = patch(vnode0, vnode1)
    expect(elm.textContent).toBe('one')
    elm = patch(vnode1, vnode2)
    expect(map(prop('textContent'), elm.childNodes)).toEqual(['two', 'three'])
  })

  it('should remove a text node among other elements', () => {
    const vnode1 = new VNode('div', {}, [
      createTextVNode('one'),
      new VNode('span', {}, undefined, 'two')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('div', {}, undefined, 'three')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(prop('textContent'), elm.childNodes)).toEqual(['one', 'two'])
    elm = patch(vnode1, vnode2)
    expect(elm.childNodes.length).toBe(1)
    expect(elm.childNodes[0].tagName).toBe('DIV')
    expect(elm.childNodes[0].textContent).toBe('three')
  })

  it('should reorder elements', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('span', {}, undefined, 'one'),
      new VNode('div', {}, undefined, 'two'),
      new VNode('b', {}, undefined, 'three')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('b', {}, undefined, 'three'),
      new VNode('span', {}, undefined, 'two'),
      new VNode('div', {}, undefined, 'one')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(inner, elm.children)).toEqual(['one', 'two', 'three'])
    elm = patch(vnode1, vnode2)
    expect(map(inner, elm.children)).toEqual(['three', 'two', 'one'])
  })

  it('should handle children with the same key but with different tag', () => {
    const vnode1 = new VNode('div', {}, [
      new VNode('div', { key: 1 }, undefined, 'one'),
      new VNode('div', { key: 2 }, undefined, 'two'),
      new VNode('div', { key: 3 }, undefined, 'three'),
      new VNode('div', { key: 4 }, undefined, 'four')
    ])
    const vnode2 = new VNode('div', {}, [
      new VNode('div', { key: 4 }, undefined, 'four'),
      new VNode('span', { key: 3 }, undefined, 'three'),
      new VNode('span', { key: 2 }, undefined, 'two'),
      new VNode('div', { key: 1 }, undefined, 'one')
    ])
    let elm = patch(vnode0, vnode1)
    expect(map(tag, elm.children)).toEqual(['DIV', 'DIV', 'DIV', 'DIV'])
    expect(map(inner, elm.children)).toEqual(['one', 'two', 'three', 'four'])
    elm = patch(vnode1, vnode2)
    expect(map(tag, elm.children)).toEqual(['DIV', 'SPAN', 'SPAN', 'DIV'])
    expect(map(inner, elm.children)).toEqual(['four', 'three', 'two', 'one'])
  })
})
