casper.test.begin('Repeat properties of an Object', 28, function (test) {
    
    casper
    .start('./fixtures/repeat-object.html')
    .then(function () {
        test.assertElementCount('.primitive', 2)
        test.assertElementCount('.obj', 2)
        test.assertSelectorHasText('.primitive:nth-child(1)', 'a 1')
        test.assertSelectorHasText('.primitive:nth-child(2)', 'b 2')
        test.assertSelectorHasText('.obj:nth-child(1)', 'a hi!')
        test.assertSelectorHasText('.obj:nth-child(2)', 'b ha!')
        test.assertSelectorHasText('#primitive', '{"a":1,"b":2}')
        test.assertSelectorHasText('#obj', '{"a":{"msg":"hi!"},"b":{"msg":"ha!"}}')
    })
    .thenClick('#push', function () {
        test.assertElementCount('.primitive', 3)
        test.assertSelectorHasText('.primitive:nth-child(3)', 'c 3')
        test.assertSelectorHasText('#primitive', '{"a":1,"b":2,"c":3}')
    })
    .thenClick('#pop', function () {
        test.assertElementCount('.primitive', 2)
        test.assertSelectorHasText('#primitive', '{"a":1,"b":2}')
    })
    .thenClick('#shift', function () {
        test.assertElementCount('.obj', 1)
        test.assertSelectorHasText('.obj:nth-child(1)', 'b ha!')
        test.assertSelectorHasText('#obj', '{"b":{"msg":"ha!"}}')
    })
    .thenClick('#unshift', function () {
        test.assertElementCount('.obj', 2)
        test.assertSelectorHasText('.obj:nth-child(1)', 'c ho!')
        test.assertSelectorHasText('.obj:nth-child(2)', 'b ha!')
        test.assertSelectorHasText('#obj', '{"b":{"msg":"ha!"},"c":{"msg":"ho!"}}')
    })
    .thenClick('#splice', function () {
        test.assertElementCount('.obj', 2)
        test.assertSelectorHasText('.obj:nth-child(1)', 'c ho!')
        test.assertSelectorHasText('.obj:nth-child(2)', 'd he!')
        test.assertSelectorHasText('#obj', '{"c":{"msg":"ho!"},"d":{"msg":"he!"}}')
    })
    // changing the object syncs to repeater
    .thenClick('#set', function () {
        test.assertSelectorHasText('.primitive:nth-child(1)', 'a 3')
        test.assertSelectorHasText('.obj:nth-child(1)', 'c hu!')
        test.assertSelectorHasText('#primitive', '{"a":3,"b":2}')
        test.assertSelectorHasText('#obj', '{"c":{"msg":"hu!"},"d":{"msg":"he!"}}')
    })
    .run(function () {
        test.done()
    })

})