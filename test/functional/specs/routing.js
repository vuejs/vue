casper.test.begin('Routing', 24, function (test) {
    
    casper
    .start('./fixtures/routing.html')
    .then(function () {
        test.assertElementCount('.view', 1)
        test.assertElementCount('.view.v-leave', 0)
        test.assertSelectorHasText('a.current', 'home')
        test.assertSelectorHasText('h1', 'Home')
        test.assertSelectorHasText('.content', 'Home sweet home!')
    })
    .thenClick('a[href$="page1"]', function () {
        test.assertSelectorHasText('a.current', 'page1')
        // in transition
        test.assertElementCount('.view', 2)
        test.assertElementCount('.view.v-leave', 1)
    })
    .wait(250, function () {
        test.assertElementCount('.view', 1)
        test.assertElementCount('.view.v-leave', 0)
        test.assertSelectorHasText('h1', 'Page1')
        test.assertSelectorHasText('.content', 'Welcome to page 1!')
    })
    .thenClick('a[href$="page2"]', function () {
        test.assertSelectorHasText('a.current', 'page2')
        // in transition
        test.assertElementCount('.view', 2)
        test.assertElementCount('.view.v-leave', 1)
    })
    .wait(250, function () {
        test.assertElementCount('.view', 1)
        test.assertElementCount('.view.v-leave', 0)
        test.assertSelectorHasText('h1', 'Page2')
        test.assertSelectorHasText('.content', 'Welcome to page 2!')
    })
    // reload to test initial page load with a route
    .reload(function () {
        test.assertSelectorHasText('a.current', 'page2')
        test.assertElementCount('.view', 1)
        test.assertElementCount('.view.v-leave', 0)
        test.assertSelectorHasText('h1', 'Page2')
        test.assertSelectorHasText('.content', 'Welcome to page 2!')
    })
    .run(function () {
        test.done()
    })

})