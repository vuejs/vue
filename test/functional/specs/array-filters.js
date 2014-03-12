casper.test.begin('Array Filters', 55, function (test) {

    var names = ['Adam', 'John', 'Julie', 'Juliette', 'Mary', 'Mike'],
        namesReversed = names.slice().reverse(),
        numbers = ['555-1276', '555-4321', '555-5678', '555-5678', '555-8765', '800-BIG-MARY'],
        numbersReversed = numbers.slice().reverse(),
        julie = ['Juliette', 'Julie'],
        julieRevesed = julie.slice().reverse()
    
    casper
    .start('./fixtures/array-filters.html')
    .then(function () {
        // count
        test.assertElementCount('#t1 .item', 6)
        test.assertElementCount('#t2 .item', 6)
        test.assertElementCount('#t3 .item', 2)

        assertOrder(names, 1)
        assertOrder(namesReversed, 2)
        assertOrder(julie, 3)
    })
    // reverse
    .thenClick('#reverse', function () {
        assertOrder(namesReversed, 1)
        assertOrder(names, 2)
    })
    // change sort key
    .thenEvaluate(function () {
        var dropdown = document.getElementById('sortby')
        dropdown.selectedIndex = 1
        var e = document.createEvent('HTMLEvents')
        e.initEvent('change', true, true)
        dropdown.dispatchEvent(e)
    })
    .then(function () {
        assertOrder(numbersReversed, 1)
        assertOrder(numbers, 2)
        assertOrder(julieRevesed, 3)
    })
    // enter search filter
    .then(function () {
        this.sendKeys('#search', 'julie')
    })
    .then(function () {
        test.assertElementCount('#t1 .item', 2)
        test.assertElementCount('#t2 .item', 2)
        test.assertElementCount('#t3 .item', 2)
        assertOrder(julieRevesed, 1)
        assertOrder(julie, 2)
    })
    // enter search filter for numbers
    .then(function () {
        this.sendKeys('#search', '555', { reset: true })
    })
    .then(function () {
        test.assertElementCount('#t1 .item', 0)
        test.assertElementCount('#t2 .item', 5)
    })
    // enter search filter for nested properties
    .then(function () {
        this.sendKeys('#search', 'hidden', { reset: true })
    })
    .then(function () {
        test.assertElementCount('#t1 .item', 0)
        test.assertElementCount('#t2 .item', 1)
    })
    // change filterkey
    .thenEvaluate(function () {
        var dropdown = document.getElementById('filterby')
        dropdown.selectedIndex = 1
        var e = document.createEvent('HTMLEvents')
        e.initEvent('change', true, true)
        dropdown.dispatchEvent(e)
    })
    .then(function () {
        test.assertElementCount('#t3 .item', 0)
    })
    .run(function () {
        test.done()
    })

    function assertOrder (list, id) {
        list.forEach(function (n, i) {
            test.assertSelectorHasText('#t' + id + ' .item:nth-child('+ (i+2) + ')', n)
        })
    }

})