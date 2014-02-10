casper.test.begin('Forms', 10, function (test) {
    
    casper
    .start('./fixtures/forms.html')
    .then(function () {
        // test initial value binding
        test.assertField('text', 'some text')
        test.assertField('checkbox', true)
        test.assertField('radio', 'b')
        test.assertField('select', 'b')
        test.assertField('multipleSelect', ['a','c'])
        test.assertField('textarea', 'more text')
    })
    .then(function () {
        this.fill('#forms', {
            'text': 'changed text',
            'checkbox': false,
            'radio': 'a',
            'select': 'a',
            'multipleSelect': ['b','d'],
            'textarea': 'more changed text'
        })
    })
    .then(function () {
        test.assertSelectorHasText('.text', 'changed text')
        test.assertSelectorHasText('.checkbox', 'false')
        test.assertSelectorHasText('.radio', 'a')
        test.assertSelectorHasText('.select', 'a')
        test.assertSelectorHasText('.multipleSelect', "['a','c']")
        test.assertSelectorHasText('.textarea', 'more changed text')
    })
    .run(function () {
        test.done()
    })

})