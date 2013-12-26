// Benchmark
// add 100 items
// toggle them one by one
// then delete them one by one

(function () {

    var benchSetting = window.location.search.match(/\bbenchmark=(\d+)/)
    if (!benchSetting) return
    
    var itemsToAdd = +benchSetting[1],
        now = window.performance && window.performance.now
            ? function () { return window.performance.now(); }
            : Date.now,
        beforeBoot = now(),
        render,
        bench,
        addTime,
        toggleTime,
        removeTime

    setTimeout(function () {

        boot = now() - beforeBoot

        var start = now(),
            last

        add()

        function add() {
            last = now()
            var newTodo = '12345'
            for (var i = 0; i < itemsToAdd; i++) {
                app.newTodo = newTodo
                app.addTodo()
            }
            setTimeout(toggle, 0)
        }

        function toggle () {
            addTime = now() - last
            var checkboxes = document.querySelectorAll('.toggle')
            //for (var j = 0; j < 5; j++) {
                for (var i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].click()
                }
            //}
            last = now()
            setTimeout(remove, 0)
        }

        function remove () {
            toggleTime = now() - last
            var deleteButtons = document.querySelectorAll('.destroy');
            for (var i = 0; i < deleteButtons.length; i++) {
                deleteButtons[i].click()
            }
            last = now()
            setTimeout(report, 0)
        }

        function report () {
            bench = now() - start
            removeTime = now() - last
            console.log('Benchmark x ' + itemsToAdd)
            console.log('boot   : ' + boot.toFixed(2) + 'ms')
            console.log('add    : ' + addTime.toFixed(2) + 'ms')
            console.log('toggle : ' + toggleTime.toFixed(2) + 'ms')
            console.log('remove : ' + removeTime.toFixed(2) + 'ms')
            console.log('total  : ' + bench.toFixed(2) + 'ms')
        }
    }, 0)

})()