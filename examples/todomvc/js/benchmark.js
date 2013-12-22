// Benchmark
// add 100 items
// toggle them one by one
// then delete them one by one

// do not run when testing in PhantomJS
if (navigator.userAgent.indexOf('PhantomJS') === -1) {
    runBenchmark()
}

function runBenchmark () {
    
    var now = window.performance && window.performance.now
            ? function () { return window.performance.now(); }
            : Date.now,
        beforeRender = now(),
        render,
        sync,
        async

    setTimeout(function () {

        render = now() - beforeRender

        var start = now(),
            newTodo = '12345'

        for (var i = 0; i < 100; i++) {
            app.newTodo = newTodo
            app.addTodo()
        }
        setTimeout(toggle, 0)

        function toggle () {
            var checkboxes = document.querySelectorAll('.toggle')
            for (var i = 0; i < checkboxes.length; i++) {
                checkboxes[i].click()
            }
            setTimeout(del, 0)
        }

        function del () {
            var deleteButtons = document.querySelectorAll('.destroy');
            for (var i = 0; i < deleteButtons.length; i++) {
                deleteButtons[i].click()
            }
            report()
        }

        function report () {
            sync = now() - start
            setTimeout(function () {
                async = now() - start
                console.log('render: ' + render.toFixed(2) + 'ms')
                console.log('sync:   ' + sync.toFixed(2) + 'ms')
                console.log('async:  ' + async.toFixed(2) + 'ms')
            }, 0)   
        }
    }, 0)

}