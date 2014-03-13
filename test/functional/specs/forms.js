casper.test.begin('Forms', 13, function (test) {
    
    casper
    .start('./fixtures/forms.html')
    .then(function () {
        // test initial value binding
        test.assertField('text', 'some text')
        test.assertField('checkbox', true)
        test.assertField('radio', 'b')
        test.assertField('select', 'b')
        // multiple select's value only returns first selected option
        test.assertField('multi', 'a')
        // manually retrieve value
        test.assertEvalEquals(function () {
            var s = document.querySelector('[name="multi"]'),
                opts = s.options
            return Array.prototype.filter.call(opts, function (o) {
                return o.selected
            }).map(function (o) {
                return o.value || o.text
            })
        }, ['a', 'c'])
        test.assertField('textarea', 'more some text')
    })
    .then(function () {
        this.fill('#forms', {
            'text': 'changed text',
            'checkbox': false,
            'radio': 'a',
            'select': 'a',
            'textarea': 'more changed text'
        })
        // Sadly casper doesn't have modifier for clicks
        // manually select values and emit a change event...
        this.evaluate(function () {
            var s = document.querySelector('[name="multi"]'),
                o = s.options
            s.selectedIndex = -1
            o[1].selected = true
            o[3].selected = true
            var e = document.createEvent('HTMLEvents')
            e.initEvent('change', true, true)
            s.dispatchEvent(e)
        })
    })
    .then(function () {
        test.assertSelectorHasText('.text', 'changed text')
        test.assertSelectorHasText('.checkbox', 'false')
        test.assertSelectorHasText('.radio', 'a')
        test.assertSelectorHasText('.select', 'a')
        test.assertSelectorHasText('.multipleSelect', '["b","d"]')
        test.assertSelectorHasText('.textarea', 'more changed text')
    })
    .run(function () {
        test.done()
    })

})