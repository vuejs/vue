function mock (id, html, attrs) {
    var el = document.createElement('div')
    el.id = id
    el.innerHTML = html
    if (attrs) {
        for (var attr in attrs) {
            el.setAttribute(attr, attrs[attr])
        }
    }
    appendMock(el)
    return el
}

function appendMock(el) {
    document.getElementById('test').appendChild(el)
}

function cleanupMock(el) {
    document.getElementById('test').removeChild(el)
}

function mockHTMLEvent (type) {
    var e = document.createEvent('HTMLEvents')
    e.initEvent(type, true, true)
    return e
}

function mockKeyEvent (type) {
    var e = document.createEvent('KeyboardEvent'),
        initMethod = e.initKeyboardEvent
            ? 'initKeyboardEvent'
            : 'initKeyEvent'
    e[initMethod](type, true, true, null, false, false, false, false, 9, 0)
    return e
}

function mockMouseEvent (type) {
    var e = document.createEvent('MouseEvent')
    e.initMouseEvent(type, true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
    return e
}

// setup

mocha.setup('bdd')
var Vue = require('vue')
var assert = chai.assert
Vue.config({silent:true})

var testDiv = document.createElement('div')
testDiv.id = 'test'
testDiv.style.display = 'none'
document.body.appendChild(testDiv)

var global = this
