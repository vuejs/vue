/* global __utils__ */
casper.on("page.error", function(msg, trace) {
  console.log(JSON.stringify(trace, null, 2))
})

casper.on("remote.message", function(msg) {
  console.log(msg)
})

casper.test.begin('todomvc', 63, function (test) {
  casper
  .start('examples/todomvc/index.html')
  .then(function () {
    test.assertNotVisible('.main', '.main should be hidden')
    test.assertNotVisible('.footer', '.footer should be hidden')
    test.assertElementCount('.filters .selected', 1, 'should have one filter selected')
    test.assertSelectorHasText('.filters .selected', 'All', 'default filter should be "All"')
  })

  // let's add a new item -----------------------------------------------

  .then(function () {
    enter('.new-todo', 'test')
  })
  .then(function () {
    test.assertElementCount('.todo', 1, 'new item should be created')
    test.assertNotVisible('.todo .edit', 'new item edit box should be hidden')
    test.assertSelectorHasText('.todo label', 'test', 'new item should have correct label text')
    test.assertSelectorHasText('.todo-count strong', '1', 'remaining count should be 1')
    test.assertEvalEquals(function () {
      return __utils__.findOne('.todo .toggle').checked
    }, false, 'new item toggle should not be checked')
    test.assertVisible('.main', '.main should now be visible')
    test.assertVisible('.footer', '.footer should now be visible')
    test.assertNotVisible('.clear-completed', '.clear-completed should be hidden')
    test.assertField({type: 'css', path: '.new-todo'}, '', 'new todo input should be reset')
  })

  // add another item ---------------------------------------------------

  .then(function () {
    createNewItem('test2')
  })
  .then(function () {
    test.assertElementCount('.todo', 2, 'should have 2 items now')
    test.assertSelectorHasText('.todo:nth-child(2) label', 'test2', 'new item should have correct label text')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // mark one item as completed -----------------------------------------

  .thenClick('.todo .toggle', function () {
    test.assertElementCount('.todo.completed', 1, 'should have 1 item completed')
    test.assertEval(function () {
      return __utils__.findOne('.todo').classList.contains('completed')
    }, 'it should be the first one')
    test.assertSelectorHasText('.todo-count strong', '1', 'remaining count should be 1')
    test.assertVisible('.clear-completed', '.clear-completed should now be visible')
  })

  // add yet another item -----------------------------------------------

  .then(function () {
    createNewItem('test3')
  })
  .then(function () {
    test.assertElementCount('.todo', 3, 'should have 3 items now')
    test.assertSelectorHasText('.todo:nth-child(3) label', 'test3', 'new item should have correct label text')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // add moreeee, now we assume they all work properly ------------------

  .then(function () {
    createNewItem('test4')
    createNewItem('test5')
  })
  .then(function () {
    test.assertElementCount('.todo', 5, 'should have 5 items now')
    test.assertSelectorHasText('.todo-count strong', '4', 'remaining count should be 4')
  })

  // check more as completed --------------------------------------------
  .then(function () {
    this.click('.todo:nth-child(4) .toggle')
    this.click('.todo:nth-child(5) .toggle')
  })
  .then(function () {
    test.assertElementCount('.todo.completed', 3, 'should have 3 item completed')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // remove a completed item --------------------------------------------

  .thenClick('.todo:nth-child(1) .destroy', function () {
    test.assertElementCount('.todo', 4, 'should have 4 items now')
    test.assertElementCount('.todo.completed', 2, 'should have 2 item completed')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // remove a incompleted item ------------------------------------------

  .thenClick('.todo:nth-child(2) .destroy', function () {
    test.assertElementCount('.todo', 3, 'should have 3 items now')
    test.assertElementCount('.todo.completed', 2, 'should have 2 item completed')
    test.assertSelectorHasText('.todo-count strong', '1', 'remaining count should be 1')
  })

  // remove all completed ------------------------------------------------

  .thenClick('.clear-completed', function () {
    test.assertElementCount('.todo', 1, 'should have 1 item now')
    test.assertSelectorHasText('.todo label', 'test2', 'the remaining one should be the second one')
    test.assertElementCount('.todo.completed', 0, 'should have no completed items now')
    test.assertSelectorHasText('.todo-count strong', '1', 'remaining count should be 1')
    test.assertNotVisible('.clear-completed', '.clear-completed should be hidden')
  })

  // prepare to test filters ------------------------------------------------
  .then(function () {
    createNewItem('test')
    createNewItem('test')
  })
  .then(function () {
    this.click('.todo:nth-child(2) .toggle')
    this.click('.todo:nth-child(3) .toggle')
  })

  // active filter ----------------------------------------------------------
  .thenClick('.filters li:nth-child(2) a', function () {
    test.assertElementCount('.todo', 1, 'filter active should have 1 item')
    test.assertElementCount('.todo.completed', 0, 'visible items should be incomplete')
  })

  // add item with filter active --------------------------------------------
  // mostly make sure v-repeat works well with v-if
  .then(function () {
    createNewItem('test')
  })
  .then(function () {
    test.assertElementCount('.todo', 2, 'should be able to create new item when fitler active')
  })

  // completed filter -------------------------------------------------------
  .thenClick('.filters li:nth-child(3) a', function () {
    test.assertElementCount('.todo', 2, 'filter completed should have 2 items')
    test.assertElementCount('.todo.completed', 2, 'visible items should be completed')
  })

  // active filter on page load ---------------------------------------------
  .thenOpen('examples/todomvc/index.html#/active', function () {
    test.assertElementCount('.todo', 2, 'filter active should have 2 items')
    test.assertElementCount('.todo.completed', 0, 'visible items should be incompleted')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // completed filter on page load ------------------------------------------
  .thenOpen('examples/todomvc/index.html#/completed', function () {
    test.assertElementCount('.todo', 2, 'filter completed should have 2 items')
    test.assertElementCount('.todo.completed', 2, 'visible items should be completed')
    test.assertSelectorHasText('.todo-count strong', '2', 'remaining count should be 2')
  })

  // toggling todos when filter is active -----------------------------------
  .thenClick('.todo .toggle', function () {
    test.assertElementCount('.todo', 1, 'should have only 1 item left')
  })
  .thenClick('.filters li:nth-child(2) a', function () {
    test.assertElementCount('.todo', 3, 'should have only 3 items now')
  })
  .thenClick('.todo .toggle', function () {
    test.assertElementCount('.todo', 2, 'should have only 2 items now')
  })

  // test editing triggered by blur ------------------------------------------
  .thenClick('.filters li:nth-child(1) a')
  .then(function () {
    doubleClick('.todo:nth-child(1) label')
  })
  .then(function () {
    test.assertElementCount('.todo.editing', 1, 'should have one item being edited')
    test.assertEval(function () {
      var input = document.querySelector('.todo:nth-child(1) .edit')
      return input === document.activeElement
    }, 'edit input should be focused')
  })
  .then(function () {
    resetField()
    this.sendKeys('.todo:nth-child(1) .edit', 'edited!') // doneEdit triggered by blur
  })
  .then(function () {
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
  })
  .then(function () {
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
  })
  .then(function () {
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
  })
  .then(function () {
    test.assertElementCount('.todo', 3, 'item should have been deleted')
  })

  // test toggle all
  .thenClick('.toggle-all', function () {
    test.assertElementCount('.todo.completed', 3, 'should toggle all items to completed')
  })
  .thenClick('.toggle-all', function () {
    test.assertElementCount('.todo:not(.completed)', 3, 'should toggle all items to active')
  })

  // run
  .run(function () {
    test.done()
  })

  // helper ===============

  function createNewItem (text) {
    if (text) {
      casper.sendKeys('.new-todo', text, { keepFocus: true })
    }
    casper.thenEvaluate(function () {
      // casper.mouseEvent can't set keyCode
      var field = document.querySelector('.new-todo')
      var e = document.createEvent('HTMLEvents')
      e.initEvent('keyup', true, true)
      e.keyCode = 13
      field.dispatchEvent(e)
    })
  }

  function enter (sel, text) {
    casper.sendKeys(sel, text, { keepFocus: true })
    casper.sendKeys(sel, casper.page.event.key.Enter)
  }

  function doubleClick (selector) {
    casper.evaluate(function (selector) {
      var el = document.querySelector(selector)
      var e = document.createEvent('MouseEvents')
      e.initMouseEvent('dblclick', true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null)
      el.dispatchEvent(e)
    }, selector)
  }

  function keyUp (code) {
    casper.thenEvaluate(function (code) {
      var input = document.querySelector('.todo:nth-child(1) .edit')
      var e = document.createEvent('HTMLEvents')
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
