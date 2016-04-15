setTimeout(function () {

  if (window.isPhantom) return
  
  // Initial load & render metrics

  metrics.afterRenderAsync = now()
  console.log('Vue load     : ' + (metrics.afterLoad - metrics.beforeLoad).toFixed(2) + 'ms')
  console.log('Render sync  : ' + (metrics.afterRender - metrics.beforeRender).toFixed(2) + 'ms')
  console.log('Render async : ' + (metrics.afterRenderAsync - metrics.beforeRender).toFixed(2) + 'ms')
  console.log('Total sync   : ' + (metrics.afterRender - metrics.beforeLoad).toFixed(2) + 'ms')
  console.log('Total async  : ' + (metrics.afterRenderAsync - metrics.beforeLoad).toFixed(2) + 'ms')

  // Benchmark
  // add 100 items
  // toggle them one by one
  // then delete them one by one

  var benchSetting = window.location.search.match(/\bbenchmark=(\d+)/)
  if (!benchSetting) return

  var itemsToAdd = +benchSetting[1],
    render,
    bench,
    addTime,
    toggleTime,
    removeTime

  var start = now(),
    last

  add()

  function add() {
    last = now()
    var newTodo = '12345',
      todoInput = document.getElementById('new-todo')
    for (var i = 0; i < itemsToAdd; i++) {
      var keyupEvent = document.createEvent('Event');
      keyupEvent.initEvent('keyup', true, true);
      keyupEvent.keyCode = 13;
      app.newTodo = 'Something to do ' + i;
      todoInput.dispatchEvent(keyupEvent)
    }
    setTimeout(toggle, 0)
  }

  function toggle () {
    addTime = now() - last
    var checkboxes = document.querySelectorAll('.toggle')
    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].click()
    }
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
    console.log('\nBenchmark x ' + itemsToAdd)
    console.log('add    : ' + addTime.toFixed(2) + 'ms')
    console.log('toggle : ' + toggleTime.toFixed(2) + 'ms')
    console.log('remove : ' + removeTime.toFixed(2) + 'ms')
    console.log('total  : ' + bench.toFixed(2) + 'ms')
  }

}, 0)
