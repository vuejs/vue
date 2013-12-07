/* global __utils__ */

casper.test.begin('todomvc', 69, function (test) {
    
    casper
    .start('../../examples/todomvc/index.html', function () {

        test.assertNotVisible('#main', '#main should be hidden')
        test.assertNotVisible('#footer', '#footer should be hidden')
        test.assertElementCount('#filters .selected', 1, 'should have one filter selected')
        test.assertSelectorHasText('#filters .selected', 'All', 'default filter should be "All"')

        // let's add a new item -----------------------------------------------

        createNewItem('test')

        test.assertElementCount('.todo', 1, 'new item should be created')
        test.assertNotVisible('.todo .edit', 'new item edit box should be hidden')
        test.assertSelectorHasText('.todo label', 'test', 'new item should have correct label text')
        test.assertSelectorHasText('#todo-count strong', '1', 'remaining count should be 1')
        test.assertEvalEquals(function () {
            return __utils__.findOne('.todo .toggle').checked
        }, false, 'new item toggle should not be checked')

        test.assertVisible('#main', '#main should now be visible')
        test.assertVisible('#footer', '#footer should now be visible')
        test.assertNotVisible('#clear-completed', '#clear-completed should be hidden')

        test.assertEvalEquals(function () {
            return __utils__.findOne('#new-todo').value
        }, '', 'new todo input should be reset')

        // add another item ---------------------------------------------------

        createNewItem('test2')

        test.assertElementCount('.todo', 2, 'should have 2 items now')
        test.assertSelectorHasText('.todo label', 'test2', 'new item should have correct label text')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')

        // mark one item as completed -----------------------------------------

        this.click('.todo .toggle')
        test.assertElementCount('.todo.completed', 1, 'should have 1 item completed')
        test.assertEval(function () {
            return __utils__.findOne('.todo').classList.contains('completed')
        }, 'it should be the first one')

        test.assertSelectorHasText('#todo-count strong', '1', 'remaining count should be 1')
        test.assertVisible('#clear-completed', '#clear-completed should now be visible')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (1)')

        // add yet another item -----------------------------------------------

        createNewItem('test3')

        test.assertElementCount('.todo', 3, 'should have 3 items now')
        test.assertSelectorHasText('.todo label', 'test3', 'new item should have correct label text')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')

        // add moreeee, now we assume they all work properly ------------------

        createNewItem('test4')
        createNewItem('test5')

        test.assertElementCount('.todo', 5, 'should have 5 items now')
        test.assertSelectorHasText('#todo-count strong', '4', 'remaining count should be 4')

        // check more as completed --------------------------------------------
        this.click('.todo:nth-child(1) .toggle')
        this.click('.todo:nth-child(2) .toggle')
        test.assertElementCount('.todo.completed', 3, 'should have 3 item completed')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (3)')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')

        // remove a completed item --------------------------------------------
        this.click('.todo:nth-child(1) .destroy')
        test.assertElementCount('.todo', 4, 'should have 4 items now')
        test.assertElementCount('.todo.completed', 2, 'should have 2 item completed')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (2)')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')

        // remove a incompleted item ------------------------------------------
        this.click('.todo:nth-child(2) .destroy')
        test.assertElementCount('.todo', 3, 'should have 3 items now')
        test.assertElementCount('.todo.completed', 2, 'should have 2 item completed')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (2)')
        test.assertSelectorHasText('#todo-count strong', '1', 'remaining count should be 1')

        // remove all completed ------------------------------------------------
        this.click('#clear-completed')
        test.assertElementCount('.todo', 1, 'should have 1 item now')
        test.assertSelectorHasText('.todo label', 'test', 'the remaining one should be the first one')
        test.assertElementCount('.todo.completed', 0, 'should have no completed items now')
        test.assertSelectorHasText('#todo-count strong', '1', 'remaining count should be 1')
        test.assertNotVisible('#clear-completed', '#clear-completed should be hidden')

    })

    // prepare to test filters ------------------------------------------------
    .then(function () {
        createNewItem('test')
        createNewItem('test')
        this.click('.todo:nth-child(1) .toggle')
        this.click('.todo:nth-child(2) .toggle')
    })

    // active filter ----------------------------------------------------------
    .thenClick('#filters li:nth-child(2) a', function () {
        test.assertElementCount('.todo', 1, 'filter active should have 2 items')
        test.assertElementCount('.todo.completed', 0, 'visible items should be incompleted')
    })

    // add item with filter active --------------------------------------------
    // mostly make sure v-repeat works well with v-if
    .then(function () {
        createNewItem('test')
        test.assertElementCount('.todo', 2, 'should be able to create new item when fitler active')
    })

    // completed filter -------------------------------------------------------
    .thenClick('#filters li:nth-child(3) a', function () {
        test.assertElementCount('.todo', 2, 'filter completed should have 2 items')
        test.assertElementCount('.todo.completed', 2, 'visible items should be completed')
    })

    // active filter on page load ---------------------------------------------
    .thenOpen('../../examples/todomvc/index.html#/active', function () {
        test.assertElementCount('.todo', 2, 'filter active should have 2 items')
        test.assertElementCount('.todo.completed', 0, 'visible items should be incompleted')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (2)')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')
    })

    // completed filter on page load ------------------------------------------
    .thenOpen('../../examples/todomvc/index.html#/completed', function () {
        test.assertElementCount('.todo', 2, 'filter completed should have 2 items')
        test.assertElementCount('.todo.completed', 2, 'visible items should be completed')
        test.assertSelectorHasText('#clear-completed', 'Remove Completed (2)')
        test.assertSelectorHasText('#todo-count strong', '2', 'remaining count should be 2')
    })

    // toggling todos when filter is active -----------------------------------
    .then(function () {
        this.click('.todo .toggle')
        test.assertElementCount('.todo', 1, 'should have only 1 item left')
    })
    .thenClick('#filters li:nth-child(2) a', function () {
        test.assertElementCount('.todo', 3, 'should have only 3 items now')
        this.click('.todo .toggle')
        test.assertElementCount('.todo', 2, 'should have only 2 items now')
    })

    // test editing triggered by blur ------------------------------------------
    .thenClick('#filters li:nth-child(1) a', function () {
        doubleClick('.todo:nth-child(1) label')
        test.assertElementCount('.todo.editing', 1, 'should have one item being edited')
    })
    .then(function () {

        test.assertEval(function () {
            var input = document.querySelector('.todo:nth-child(1) .edit')
            return input === document.activeElement
        }, 'edit input should be focused')

        resetField()
        this.sendKeys('.todo:nth-child(1) .edit', 'edited!') // doneEdit triggered by blur

        test.assertElementCount('.todo.editing', 0, 'item should no longer be edited')
        test.assertSelectorHasText('.todo:nth-child(1) label', 'edited!', 'item should have updated text')
    })

    // test editing triggered by enter ----------------------------------------
    .then(function () {
        doubleClick('.todo label')
    })
    .then(function () {
        resetField()
        this.sendKeys('.todo:nth-child(1) .edit', 'edited again!', { keepFocus: true })
        keyUp(13) // Enter
        test.assertElementCount('.todo.editing', 0, 'item should no longer be edited')
        test.assertSelectorHasText('.todo:nth-child(1) label', 'edited again!', 'item should have updated text')
    })

    // test cancel ------------------------------------------------------------
    .then(function () {
        doubleClick('.todo label')
    })
    .then(function () {
        resetField()
        this.sendKeys('.todo:nth-child(1) .edit', 'cancel test', { keepFocus: true })
        keyUp(27) // ESC
        test.assertElementCount('.todo.editing', 0, 'item should no longer be edited')
        test.assertSelectorHasText('.todo label', 'edited again!', 'item should not have updated text')
    })

    // test empty input remove ------------------------------------------------
    .then(function () {
        doubleClick('.todo label')
    })
    .then(function () {
        resetField()
        this.sendKeys('.todo:nth-child(1) .edit', ' ')
        test.assertElementCount('.todo', 3, 'item should have been deleted')
    })

    //test toggle all
    .thenClick('#toggle-all', function () {
        test.assertElementCount('.todo.completed', 3, 'should toggle all items to completed')
    })
    .thenClick('#toggle-all', function () {
        test.assertElementCount('.todo:not(.completed)', 3, 'should toggle all items to active')
    })

    // run
    .run(function () {
        test.done()
    })

    // helper ===============

    function createNewItem (text) {
        casper.sendKeys('#new-todo', text)
        casper.evaluate(function () {
            // casper.mouseEvent can't set keyCode
            var field = document.getElementById('new-todo'),
                e = document.createEvent('HTMLEvents')
            e.initEvent('keyup', true, true)
            e.keyCode = 13
            field.dispatchEvent(e)
        })
    }

    function doubleClick (selector) {
        casper.evaluate(function (selector) {
            var el = document.querySelector(selector),
                e = document.createEvent('MouseEvents')
            e.initMouseEvent('dblclick', true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
            el.dispatchEvent(e)
        }, selector)
    }

    function keyUp (code) {
        casper.evaluate(function (code) {
            var input = document.querySelector('.todo:nth-child(1) .edit'),
                e = document.createEvent('HTMLEvents')
            e.initEvent('keyup', true, true)
            e.keyCode = code
            input.dispatchEvent(e)
        }, code)
    }

    function resetField () {
        // somehow casper.sendKey() option reset:true doesn't work
        casper.evaluate(function () {
            document.querySelector('.todo:nth-child(1) .edit').value = ''
        })
    }

})