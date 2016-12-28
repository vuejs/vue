import { Selector } from 'testcafe'

class CommitCollection {
    constructor (selector) {
        this.allItems = Selector(selector)
        this.ids = this.allItems.find('.commit')
        this.messages = this.allItems.find('.message')
    }
}

export class CommitsPage {
    constructor () {
        this.branch = {
            current: Selector('p'),
            labelForMaster: Selector('label[for="master"]'),
            labelForDev: Selector('label[for="dev"]'),
            master: Selector('#master'),
            dev: Selector('#dev'),
            inputs: Selector('input'),
            labels: Selector('label')
        }

        this.commits = new CommitCollection('li')
    }
}

export class GridPage {
    constructor () {
        this.table = Selector('table')
        this.query = Selector('input[name="query"]')
        this.noMatchesFound = Selector('p')
    }
}

export class MarkdownPage {
    constructor () {
        const editor = Selector('#editor')

        this.src = editor.find('textarea')
        this.result = editor.find('div')
    }
}

class ModalControl {
    constructor (selector) {
        this.mainElement = Selector(selector)
        this.wrapper = this.mainElement.find('.modal-wrapper')
        this.container = this.wrapper.find('.modal-container')
        this.header = this.container.find('.modal-header')
        this.body = this.container.find('.modal-body')
        this.footer = this.container.find('.modal-footer')
        this.defaultButton = this.container.find('.modal-default-button')
    }
}

export class ModalPage {
    constructor () {
        this.showModalBtn = Selector('#show-modal')
        this.modal = new ModalControl('.modal-mask')
    }
}

class Select2 {
    constructor (selector) {
        this.fallbackSelect = Selector(selector)
        this.container = Selector('span.select2-container')
        this.dropdown = this.container.find('.select2-selection__rendered')
        this.options = this.container.find('.select2-results__option')
    }
}

export class Select2Page {
    constructor () {
        this.selected = Selector('p')
        this.select2 = new Select2('select')
    }
}

export class SvgPage {
    constructor () {
        this.svg = Selector('svg')
        this.ranges = Selector('input[type="range"]')
        this.labels = Selector('label')
        this.buttons = Selector('button')

        this.addForm = {
            input: Selector('input[name="newlabel"]'),
            button: Selector('#add > button')
        }
    }
}

export class TodomvcPage {
    constructor () {
        const newTodo = Selector('.new-todo')
        const itemsContainer = Selector('.main')
        const allItems = itemsContainer.find('li.todo')
        const getItemDelete = index => allItems.nth(index).find('.destroy')

        this.newTodo = newTodo

        this.items = {
            container: itemsContainer,
            all: allItems,
            completed: itemsContainer.find('li.todo.completed'),
            getLabel: index => allItems.nth(index).find('label'),
            getCheckbox: index => allItems.nth(index).find('.toggle'),
            getEdit: index => allItems.nth(index).find('.edit'),
            getDelete: getItemDelete,
            toggleAll: itemsContainer.find('.toggle-all'),
            edited: itemsContainer.find('.todo.editing'),
            createNewItem: async function createNewItem (t, text) {
                await t.typeText(newTodo, text)
                    .pressKey('enter')
            },
            removeItemAt: async function removeItemAt (t, n) {
                await t.hover(allItems.nth(n), { offsetX: 10, offsetY: 10 })
                    .click(getItemDelete(n))
            }
        }

        const footerContainer = Selector('.footer')
        const filtersContainer = footerContainer.find('.filters')

        this.footer = {
            container: footerContainer,
            filters: {
                all: filtersContainer.find('a').withText('All'),
                active: filtersContainer.find('a').withText('Active'),
                completed: filtersContainer.find('a').withText('Completed'),
                getSelected: () => filtersContainer.find('.selected')
            },
            clearCompleted: footerContainer.find('.clear-completed'),
            countLeftItems: footerContainer.find('.todo-count strong')
        }
    }
}

class TreeNode {
    constructor (selector) {
        this.node = Selector(selector)
        this.name = this.node.child('div')
        this.childNodesContainer = this.node.child('ul')
        this.addNew = this.childNodesContainer.child('li.add')
    }
}

export class TreePage {
    constructor () {
        this.allItems = Selector('.item')
        this.allAddItems = Selector('.add')
        this.allChildFolders = this.allItems.find('ul')

        this.createModelFromDomNode = node => new TreeNode(node)

        const rootContainer = Selector('#demo')

        this.topLevelRoot = this.createModelFromDomNode(rootContainer.child('li'))
    }
}

