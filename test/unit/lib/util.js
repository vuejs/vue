var scope = typeof window === 'undefined'
  ? global
  : window

// Some versions of phantomjs doesn't have bind defined. 
// See https://github.com/ariya/phantomjs/issues/10522
Function.prototype.bind = Function.prototype.bind || function (thisp) {
  var fn = this;
  return function () {
    return fn.apply(thisp, arguments);
  };
};

scope.hasWarned = function (_, msg, silent) {
  var count = _.warn.calls.count()
  while (count--) {
    var args = _.warn.calls.argsFor(count)
    if (args.some(containsMsg)) {
      return true
    }
  }

  if (!silent) {
    console.warn('[test] "' + msg + '" was never warned.')
  }

  function containsMsg (arg) {
    return arg.indexOf(msg) > -1
  }
}

scope.process = {
  env: {
    NODE_ENV: 'development'
  }
}
