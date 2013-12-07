// instrument by jscoverage, do not modifly this file
(function () {
  var BASE;
  if (typeof global === 'object') {
    BASE = global;
  } else if (typeof window === 'object') {
    BASE = window;
  } else {
    throw new Error('[jscoverage] unknow ENV!');
  }
  if (!BASE._$jscoverage) {
    BASE._$jscoverage = {};
    BASE._$jscoverage_cond = {};
    BASE._$jscoverage_done = function (file, line, express) {
      if (arguments.length === 2) {
        BASE._$jscoverage[file][line] ++;
      } else {
        BASE._$jscoverage_cond[file][line] ++;
        return express;
      }
    };
    BASE._$jscoverage_init = function (base, file, lines) {
      var tmp = [];
      for (var i = 0; i < lines.length; i ++) {
        tmp[lines[i]] = 0;
      }
      base[file] = tmp;
    };
  }
})();
_$jscoverage_init(_$jscoverage, "./test/vue.test.js",[11,14,15,16,17,18,19,20,21,24,29,30,31,32,33,34,35,36,39,46,52,68,69,69,71,79,80,81,81,82,82,95,96,98,98,100,101,103,104,105,106,107,111,122,123,134,135,136,138,149,150,157,158,159,159,161,169,170,177,178,179,179,180,180,185,186,187,187,188,189,196,197,200,202,203,204,204,205,206,206,208,211,217,223,232,232,244,245,247,259,260,261,263,276,277,278,281,282,285,286,287,300,303,306,307,308,312,313,313,316,317,318,322,323,323,324,335,336,337,340,341,342,343,347,358,359,360,371,372,376,377,386,387,388,389,389,391,397,398,398,399,400,406,407,407,408,409,415,416,416,417,418,424,425,425,426,427,433,434,434,435,436,442,443,443,444,445,448,456,459,460,462,463,464,468,469,472,473,474,475,476,482,483,484,485,502,503,503,504,505,505,506,507,508,509,512,519,530,534,537,538,540,542,545,549,552,554,555,566,567,579,582,597,599,599,600,609,609,610,622,630,631,641,652,653,653,654,662,665,666,667,667,668,669,671,678,679,681,682,683,683,684,686,689,691,692,694,702,703,711,712,719,724,725,726,729,730,731,734,735,736,739,740,748,749,757,758,759,764,765,790,794,797,798,799,802,803,806,807,807,809,810,811,812,816,817,818,819,824,828,829,832,838,839,840,841,842,843,848,851,852,856,857,858,859,860,866,867,868,869,874,879,880,881,882,885,885,888,891,897,899,903,904,907,908,909,910,911,913,915,916,921,921,922,922,923,924,925,926,930,938,940,946,949,951,952,955,956,957,960,961,962,966,967,975,977,979,982,982,985,999,1002,1003,1004,1008,1010,1013,1015,1016,1016,1021,1024,1025,1026,1027,1028,1029,1034,1037,1039,1044,1045,1052,1055,1063,1064,1066,1067,1069,1070,1071,1072,1073,1076,1077,1078,1079,1080,1081,1082,1085,1085,1089,1090,1091,1092,1100,1101,1102,1102,1103,1105,1106,1107,1108,1109,1111,1112,1113,1116,1117,1118,1119,1123,1125,1127,1133,1136,1140,1141,1141,1142,1146,1152,1154,1155,1159,1166,1169,1170,1172,1174,1175,1179,1180,1181,1183,1191,1193,1197,1200,1201,1202,1203,1206,1207,1210,1211,1214,1215,1217,1219,1220,1223,1227,1234,1236,1238,1244,1246,1247,1251,1254,1257,1258,1262,1264,1269,1270,1271,1272,1274,1276,1278,1279,1280,1283,1292,1293,1295,1297,1298,1300,1301,1302,1306,1312,1313,1314,1320,1322,1331,1331,1334,1335,1338,1339,1340,1344,1345,1346,1346,1348,1352,1353,1354,1358,1359,1360,1361,1362,1364,1369,1371,1372,1373,1374,1379,1380,1381,1382,1383,1394,1395,1396,1397,1399,1400,1401,1404,1411,1414,1416,1417,1427,1432,1438,1439,1441,1441,1442,1443,1445,1452,1453,1459,1463,1465,1465,1466,1472,1473,1479,1480,1483,1484,1485,1486,1493,1494,1497,1498,1499,1500,1507,1508,1509,1510,1519,1521,1526,1528,1537,1538,1539,1540,1541,1542,1543,1544,1545,1548,1553,1554,1555,1556,1557,1559,1566,1567,1568,1569,1571,1578,1579,1580,1581,1588,1589,1590,1591,1593,1594,1595,1596,1597,1601,1603,1606,1626,1629,1630,1631,1632,1637,1642,1644,1645,1647,1648,1649,1652,1654,1655,1657,1658,1663,1664,1667,1668,1669,1670,1673,1675,1676,1678,1679,1685,1686,1693,1694,1695,1696,1697,1705,1706,1707,1708,1718,1719,1720,1721,1723,1724,1735,1739,1743,1744,1748,1749,1751,1754,1755,1756,1757,1760,1767,1768,1778,1779,1781,1782,1783,1784,1796,1797,1798,1799,1809,1809,1810,1811,1812,1813,1813,1814,1816,1817,1818,1818,1822,1834,1835,1837,1838,1840,1841,1842,1844,1847,1852,1853,1855,1856,1857,1861,1865,1866,1868,1877,1877,1878,1879,1880,1884,1888,1889,1915,1916,1917,1919,1922,1923,1925,1926,1927,1929,1935,1936,1937,1940,1941,1943,1945,1947,1948,1949,1950,1951,1952,1953,1953,1955,1955,1957,1961,1968,1969,1970,1971,1974,1980,1981,1982,1986,1987,1988,1989,1992,2000,2001,2001,2002,2003,2006,2008,2009,2010,2013,2027,2028,2028,2029,2030,2037,2040,2040,2042,2043,2045,2046,2046,2047,2049,2055,2056,2066,2067,2068,2069,2070,2072,2082,2084,2084,2085,2085,2086,2086,2095,2096,2105,2107,2108,2108,2109,2111,2112,2112,2114,2115,2116,2117,2118,2121,2125,2130,2132,2133,2138,2163,2169,2186,2192,2193,2194,2196,2197,2198,2200,2204,2205,2209,2211,2221,2222,2223,2225,2227,2234,2239,2248,2249,2250,2252,2253,2264,2265,2266,2267,2269,2271,2272,2276,2277,2279,2285,2285,2286,2288,2289,2290,2290,2291,2292,2294,2294,2295,2300,2301,2310,2310,2311,2312,2313,2314,2314,2315,2316,2317,2318,2320,2321,2324,2335,2336,2337,2338,2339,2344,2345,2356,2362,2362,2363,2364,2371,2380,2389,2389,2390,2395,2408,2418,2418,2419,2420,2421,2423,2424,2425,2431,2432,2455,2457,2458,2459,2462,2464,2465,2472,2473,2479,2480,2485,2492,2493,2494,2497,2500,2503,2504,2505,2509,2511,2514,2516,2517,2522,2523,2524,2525,2526,2528,2529,2533,2534,2535,2543,2544,2545,2546,2549,2552,2553,2554,2555,2557,2558,2560,2561,2562,2564,2565,2574,2581,2582,2583,2588,2589,2592,2600,2604,2608,2612,2616,2619,2621,2625,2626,2628,2629,2631,2632,2633,2640,2643,2651,2653,2653,2654,2655,2659,2660,2663,2666,2667,2668,2673,2675,2676,2677,2679,2684,2688,2689,2691,2695,2695,2697,2698,2699,2701,2703,2707,2707,2708,2709,2714,2718,2719,2730,2733,2735,2736,2741,2742,2742,2746,2747,2748,2753,2754,2754,2758,2763,2764,2766,2767,2772,2778,2779,2780,2781,2782,2783,2784,2788,2789,2791,2795,2796,2797,2798,2803,2807,2812,2813,2814,2817,2820,2821,2822,2824,2825,2826,2827,2828,2829,2830,2831,2832,2834,2841,2843,2847,2848,2849,2851,2852,2856,2856,2857,2860,2861,2862,2863,2865,2876,2883,2884,2888,2888,2890,2891,2892,2897,2898,2911,2914,2916,2924,2925,2926,2935,2935,2936,2938,2939,2939,2943,2943,2944,2947,2947,2948,2949,2951,2956,2957,2958,2959,2960,2963,2965,2966,2968,2972,2973,2976,2977,2977,2978,2982,2987,2990,2992,2997,2998,2999,3002,3006,3014,3018,3018,3021,3022,3023,3024,3025,3026,3027,3030,3031,3036,3037,3038,3039,3040,3041,3043,3045,3051,3052,3053,3053,3057,3058,3061,3065,3069,3072,3081,3086,3094,3095,3096,3101,3102,3103,3104,3110,3111,3112,3114,3118,3119,3121,3122,3125,3126,3127,3130,3131,3136,3136,3138,3140,3142,3145,3146,3147,3148,3151,3152,3153,3154,3155,3157,3162,3163,3164,3165,3170,3171,3172,3174]);
_$jscoverage_init(_$jscoverage_cond, "./test/vue.test.js",[14,29,29,69,81,82,98,104,106,106,135,159,179,180,187,204,206,232,306,313,316,323,340,387,389,398,407,416,425,434,443,473,475,503,505,505,506,508,508,599,599,609,653,653,667,678,681,683,724,729,734,739,748,748,757,757,807,839,841,851,859,859,866,885,904,907,907,909,921,922,924,966,979,982,999,1003,1008,1008,1013,1013,1016,1025,1027,1037,1044,1066,1066,1080,1085,1089,1102,1107,1108,1111,1118,1140,1141,1152,1155,1174,1179,1180,1197,1201,1215,1220,1244,1244,1247,1247,1258,1258,1258,1258,1258,1270,1271,1274,1297,1301,1331,1344,1344,1346,1359,1361,1371,1373,1379,1381,1394,1399,1441,1465,1498,1644,1648,1654,1657,1663,1669,1675,1678,1694,1696,1707,1707,1720,1748,1748,1778,1798,1809,1813,1816,1818,1834,1837,1856,1856,1865,1877,1877,1922,1926,1926,1935,1948,1953,1955,1969,1986,1988,2001,2008,2028,2028,2040,2042,2046,2046,2084,2085,2086,2108,2112,2115,2117,2193,2196,2205,2205,2249,2285,2290,2294,2310,2314,2362,2362,2389,2389,2418,2420,2424,2457,2464,2472,2492,2500,2503,2524,2544,2552,2553,2560,2582,2625,2628,2631,2653,2675,2676,2688,2695,2698,2707,2742,2754,2782,2831,2831,2847,2847,2847,2856,2860,2883,2888,2911,2935,2939,2943,2947,2948,2956,2977,2987,2998,3006,3006,3006,3006,3018,3023,3040,3053,3103,3118,3126,3126,3136,3140,3146,3152,3154,3163]);
_$jscoverage["./test/vue.test.js"].source = ["","/**"," * Require the given path."," *"," * @param {String} path"," * @return {Object} exports"," * @api public"," */","","function require(path, parent, orig) {","  var resolved = require.resolve(path);","","  // lookup failed","  if (null == resolved) {","    orig = orig || path;","    parent = parent || 'root';","    var err = new Error('Failed to require \"' + orig + '\" from \"' + parent + '\"');","    err.path = orig;","    err.parent = parent;","    err.require = true;","    throw err;","  }","","  var module = require.modules[resolved];","","  // perform real require()","  // by invoking the module's","  // registered function","  if (!module._resolving && !module.exports) {","    var mod = {};","    mod.exports = {};","    mod.client = mod.component = true;","    module._resolving = true;","    module.call(this, mod.exports, require.relative(resolved), mod);","    delete module._resolving;","    module.exports = mod.exports;","  }","","  return module.exports;","}","","/**"," * Registered modules."," */","","require.modules = {};","","/**"," * Registered aliases."," */","","require.aliases = {};","","/**"," * Resolve `path`."," *"," * Lookup:"," *"," *   - PATH/index.js"," *   - PATH.js"," *   - PATH"," *"," * @param {String} path"," * @return {String} path or null"," * @api private"," */","","require.resolve = function(path) {","  if (path.charAt(0) === '/') path = path.slice(1);","","  var paths = [","    path,","    path + '.js',","    path + '.json',","    path + '/index.js',","    path + '/index.json'","  ];","","  for (var i = 0; i < paths.length; i++) {","    var path = paths[i];","    if (require.modules.hasOwnProperty(path)) return path;","    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];","  }","};","","/**"," * Normalize `path` relative to the current path."," *"," * @param {String} curr"," * @param {String} path"," * @return {String}"," * @api private"," */","","require.normalize = function(curr, path) {","  var segs = [];","","  if ('.' != path.charAt(0)) return path;","","  curr = curr.split('/');","  path = path.split('/');","","  for (var i = 0; i < path.length; ++i) {","    if ('..' == path[i]) {","      curr.pop();","    } else if ('.' != path[i] && '' != path[i]) {","      segs.push(path[i]);","    }","  }","","  return curr.concat(segs).join('/');","};","","/**"," * Register module at `path` with callback `definition`."," *"," * @param {String} path"," * @param {Function} definition"," * @api private"," */","","require.register = function(path, definition) {","  require.modules[path] = definition;","};","","/**"," * Alias a module definition."," *"," * @param {String} from"," * @param {String} to"," * @api private"," */","","require.alias = function(from, to) {","  if (!require.modules.hasOwnProperty(from)) {","    throw new Error('Failed to alias \"' + from + '\", it does not exist');","  }","  require.aliases[to] = from;","};","","/**"," * Return a require function relative to the `parent` path."," *"," * @param {String} parent"," * @return {Function}"," * @api private"," */","","require.relative = function(parent) {","  var p = require.normalize(parent, '..');","","  /**","   * lastIndexOf helper.","   */","","  function lastIndexOf(arr, obj) {","    var i = arr.length;","    while (i--) {","      if (arr[i] === obj) return i;","    }","    return -1;","  }","","  /**","   * The relative require() itself.","   */","","  function localRequire(path) {","    var resolved = localRequire.resolve(path);","    return require(resolved, parent, path);","  }","","  /**","   * Resolve relative to the parent.","   */","","  localRequire.resolve = function(path) {","    var c = path.charAt(0);","    if ('/' == c) return path.slice(1);","    if ('.' == c) return require.normalize(p, path);","","    // resolve deps by returning","    // the dep in the nearest \"deps\"","    // directory","    var segs = parent.split('/');","    var i = lastIndexOf(segs, 'deps') + 1;","    if (!i) i = 0;","    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;","    return path;","  };","","  /**","   * Check if module is defined at `path`.","   */","","  localRequire.exists = function(path) {","    return require.modules.hasOwnProperty(localRequire.resolve(path));","  };","","  return localRequire;","};","require.register(\"component-indexof/index.js\", function(exports, require, module){","module.exports = function(arr, obj){","  if (arr.indexOf) return arr.indexOf(obj);","  for (var i = 0; i < arr.length; ++i) {","    if (arr[i] === obj) return i;","  }","  return -1;","};","});","require.register(\"component-emitter/index.js\", function(exports, require, module){","","/**"," * Module dependencies."," */","","var index = require('indexof');","","/**"," * Expose `Emitter`."," */","","module.exports = Emitter;","","/**"," * Initialize a new `Emitter`."," *"," * @api public"," */","","function Emitter(obj) {","  if (obj) return mixin(obj);","};","","/**"," * Mixin the emitter properties."," *"," * @param {Object} obj"," * @return {Object}"," * @api private"," */","","function mixin(obj) {","  for (var key in Emitter.prototype) {","    obj[key] = Emitter.prototype[key];","  }","  return obj;","}","","/**"," * Listen on the given `event` with `fn`."," *"," * @param {String} event"," * @param {Function} fn"," * @return {Emitter}"," * @api public"," */","","Emitter.prototype.on = function(event, fn){","  this._callbacks = this._callbacks || {};","  (this._callbacks[event] = this._callbacks[event] || [])","    .push(fn);","  return this;","};","","/**"," * Adds an `event` listener that will be invoked a single"," * time then automatically removed."," *"," * @param {String} event"," * @param {Function} fn"," * @return {Emitter}"," * @api public"," */","","Emitter.prototype.once = function(event, fn){","  var self = this;","  this._callbacks = this._callbacks || {};","","  function on() {","    self.off(event, on);","    fn.apply(this, arguments);","  }","","  fn._off = on;","  this.on(event, on);","  return this;","};","","/**"," * Remove the given callback for `event` or all"," * registered callbacks."," *"," * @param {String} event"," * @param {Function} fn"," * @return {Emitter}"," * @api public"," */","","Emitter.prototype.off =","Emitter.prototype.removeListener =","Emitter.prototype.removeAllListeners = function(event, fn){","  this._callbacks = this._callbacks || {};","","  // all","  if (0 == arguments.length) {","    this._callbacks = {};","    return this;","  }","","  // specific event","  var callbacks = this._callbacks[event];","  if (!callbacks) return this;","","  // remove all handlers","  if (1 == arguments.length) {","    delete this._callbacks[event];","    return this;","  }","","  // remove specific handler","  var i = index(callbacks, fn._off || fn);","  if (~i) callbacks.splice(i, 1);","  return this;","};","","/**"," * Emit `event` with the given args."," *"," * @param {String} event"," * @param {Mixed} ..."," * @return {Emitter}"," */","","Emitter.prototype.emit = function(event){","  this._callbacks = this._callbacks || {};","  var args = [].slice.call(arguments, 1)","    , callbacks = this._callbacks[event];","","  if (callbacks) {","    callbacks = callbacks.slice(0);","    for (var i = 0, len = callbacks.length; i < len; ++i) {","      callbacks[i].apply(this, args);","    }","  }","","  return this;","};","","/**"," * Return array of callbacks for `event`."," *"," * @param {String} event"," * @return {Array}"," * @api public"," */","","Emitter.prototype.listeners = function(event){","  this._callbacks = this._callbacks || {};","  return this._callbacks[event] || [];","};","","/**"," * Check if this emitter has `event` handlers."," *"," * @param {String} event"," * @return {Boolean}"," * @api public"," */","","Emitter.prototype.hasListeners = function(event){","  return !! this.listeners(event).length;","};","","});","require.register(\"vue/src/main.js\", function(exports, require, module){","var config      = require('./config'),","    ViewModel   = require('./viewmodel'),","    directives  = require('./directives'),","    filters     = require('./filters'),","    utils       = require('./utils')","","/**"," *  Set config options"," */","ViewModel.config = function (opts) {","    if (opts) {","        utils.extend(config, opts)","        if (opts.prefix) updatePrefix()","    }","    return this","}","","/**"," *  Allows user to register/retrieve a directive definition"," */","ViewModel.directive = function (id, fn) {","    if (!fn) return directives[id]","    directives[id] = fn","    return this","}","","/**"," *  Allows user to register/retrieve a filter function"," */","ViewModel.filter = function (id, fn) {","    if (!fn) return filters[id]","    filters[id] = fn","    return this","}","","/**"," *  Allows user to register/retrieve a ViewModel constructor"," */","ViewModel.component = function (id, Ctor) {","    if (!Ctor) return utils.components[id]","    utils.components[id] = utils.toConstructor(Ctor)","    return this","}","","/**"," *  Allows user to register/retrieve a Custom element constructor"," */","ViewModel.element = function (id, Ctor) {","    if (!Ctor) return utils.elements[id]","    utils.elements[id] = utils.toConstructor(Ctor)","    return this","}","","/**"," *  Allows user to register/retrieve a template partial"," */","ViewModel.partial = function (id, partial) {","    if (!partial) return utils.partials[id]","    utils.partials[id] = utils.toFragment(partial)","    return this","}","","/**"," *  Allows user to register/retrieve a transition definition object"," */","ViewModel.transition = function (id, transition) {","    if (!transition) return utils.transitions[id]","    utils.transitions[id] = transition","    return this","}","","ViewModel.extend = extend","","/**"," *  Expose the main ViewModel class"," *  and add extend method"," */","function extend (options) {","","    var ParentVM = this","","    // inherit options","    options = inheritOptions(options, ParentVM.options, true)","    utils.processOptions(options)","","    var ExtendedVM = function (opts) {","        opts = inheritOptions(opts, options, true)","        ParentVM.call(this, opts)","    }","","    // inherit prototype props","    var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype)","    utils.defProtected(proto, 'constructor', ExtendedVM)","","    // copy prototype props","    var protoMixins = options.proto","    if (protoMixins) {","        for (var key in protoMixins) {","            if (!(key in ViewModel.prototype)) {","                proto[key] = protoMixins[key]","            }","        }","    }","","    // allow extended VM to be further extended","    ExtendedVM.extend = extend","    ExtendedVM.super = ParentVM","    ExtendedVM.options = options","    return ExtendedVM","}","","/**"," *  Inherit options"," *"," *  For options such as `scope`, `vms`, `directives`, 'partials',"," *  they should be further extended. However extending should only"," *  be done at top level."," *  "," *  `proto` is an exception because it's handled directly on the"," *  prototype."," *"," *  `el` is an exception because it's not allowed as an"," *  extension option, but only as an instance option."," */","function inheritOptions (child, parent, topLevel) {","    child = child || utils.hash()","    if (!parent) return child","    for (var key in parent) {","        if (key === 'el' || key === 'proto') continue","        if (!child[key]) { // child has priority","            child[key] = parent[key]","        } else if (topLevel && utils.typeOf(child[key]) === 'Object') {","            inheritOptions(child[key], parent[key], false)","        }","    }","    return child","}","","/**"," *  Update prefix for some special directives"," *  that are used in compilation."," */","var specialAttributes = [","    'id',","    'pre',","    'text',","    'repeat',","    'partial',","    'component',","    'transition'","]","","function updatePrefix () {","    specialAttributes.forEach(setPrefix)","}","","function setPrefix (attr) {","    config.attrs[attr] = config.prefix + '-' + attr","}","","updatePrefix()","module.exports = ViewModel","});","require.register(\"vue/src/emitter.js\", function(exports, require, module){","// shiv to make this work for Component, Browserify and Node at the same time.","var Emitter,","    componentEmitter = 'emitter'","","try {","    // Requiring without a string literal will make browserify","    // unable to parse the dependency, thus preventing it from","    // stopping the compilation after a failed lookup.","    Emitter = require(componentEmitter)","} catch (e) {}","","module.exports = Emitter || require('events').EventEmitter","});","require.register(\"vue/src/config.js\", function(exports, require, module){","module.exports = {","","    prefix      : 'v',","    debug       : false,","    silent      : false,","    enterClass  : 'v-enter',","    leaveClass  : 'v-leave',","    attrs       : {}","    ","}","});","require.register(\"vue/src/utils.js\", function(exports, require, module){","var config    = require('./config'),","    attrs     = config.attrs,","    toString  = Object.prototype.toString,","    join      = Array.prototype.join,","    console   = window.console,","    ViewModel // late def","","/**"," *  Create a prototype-less object"," *  which is a better hash/map"," */","function makeHash () {","    return Object.create(null)","}","","var utils = module.exports = {","","    hash: makeHash,","","    // global storage for user-registered","    // vms, partials and transitions","    components  : makeHash(),","    partials    : makeHash(),","    transitions : makeHash(),","    elements    : makeHash(),","","    /**","     *  get an attribute and remove it.","     */","    attr: function (el, type, noRemove) {","        var attr = attrs[type],","            val = el.getAttribute(attr)","        if (!noRemove && val !== null) el.removeAttribute(attr)","        return val","    },","","    /**","     *  Define an ienumerable property","     *  This avoids it being included in JSON.stringify","     *  or for...in loops.","     */","    defProtected: function (obj, key, val, enumerable, configurable) {","        if (obj.hasOwnProperty(key)) return","        Object.defineProperty(obj, key, {","            value        : val,","            enumerable   : !!enumerable,","            configurable : !!configurable","        })","    },","","    /**","     *  Accurate type check","     *  internal use only, so no need to check for NaN","     */","    typeOf: function (obj) {","        return toString.call(obj).slice(8, -1)","    },","","    /**","     *  Most simple bind","     *  enough for the usecase and fast than native bind()","     */","    bind: function (fn, ctx) {","        return function (arg) {","            return fn.call(ctx, arg)","        }","    },","","    /**","     *  Make sure only strings and numbers are output to html","     *  output empty string is value is not string or number","     */","    toText: function (value) {","        /* jshint eqeqeq: false */","        return (typeof value === 'string' ||","            typeof value === 'boolean' ||","            (typeof value === 'number' && value == value)) // deal with NaN","            ? value","            : ''","    },","","    /**","     *  simple extend","     */","    extend: function (obj, ext, protective) {","        for (var key in ext) {","            if (protective && obj[key]) continue","            obj[key] = ext[key]","        }","    },","","    /**","     *  filter an array with duplicates into uniques","     */","    unique: function (arr) {","        var hash = utils.hash(),","            i = arr.length,","            key, res = []","        while (i--) {","            key = arr[i]","            if (hash[key]) continue","            hash[key] = 1","            res.push(key)","        }","        return res","    },","","    /**","     *  Convert a string template to a dom fragment","     */","    toFragment: function (template) {","        if (typeof template !== 'string') {","            return template","        }","        if (template.charAt(0) === '#') {","            var templateNode = document.getElementById(template.slice(1))","            if (!templateNode) return","            template = templateNode.innerHTML","        }","        var node = document.createElement('div'),","            frag = document.createDocumentFragment(),","            child","        node.innerHTML = template.trim()","        /* jshint boss: true */","        while (child = node.firstChild) {","            frag.appendChild(child)","        }","        return frag","    },","","    /**","     *  Convert the object to a ViewModel constructor","     *  if it is not already one","     */","    toConstructor: function (obj) {","        ViewModel = ViewModel || require('./viewmodel')","        return utils.typeOf(obj) === 'Object'","            ? ViewModel.extend(obj)","            : typeof obj === 'function'","                ? obj","                : null","    },","","    isConstructor: function (obj) {","        ViewModel = ViewModel || require('./viewmodel')","        return obj.prototype instanceof ViewModel || obj === ViewModel","    },","","    /**","     *  convert certain option values to the desired format.","     */","    processOptions: function (options) {","        var components = options.components,","            partials   = options.partials,","            template   = options.template,","            elements   = options.elements,","            key","        if (components) {","            for (key in components) {","                components[key] = utils.toConstructor(components[key])","            }","        }","        if (elements) {","            for (key in elements) {","                elements[key] = utils.toConstructor(elements[key])","            }","        }","        if (partials) {","            for (key in partials) {","                partials[key] = utils.toFragment(partials[key])","            }","        }","        if (template) {","            options.template = utils.toFragment(template)","        }","    },","","    /**","     *  log for debugging","     */","    log: function () {","        if (config.debug && console) {","            console.log(join.call(arguments, ' '))","        }","    },","    ","    /**","     *  warnings, thrown in all cases","     */","    warn: function() {","        if (!config.silent && console) {","            console.trace()","            console.warn(join.call(arguments, ' '))","        }","    }","}","});","require.register(\"vue/src/compiler.js\", function(exports, require, module){","var Emitter     = require('./emitter'),","    Observer    = require('./observer'),","    config      = require('./config'),","    utils       = require('./utils'),","    Binding     = require('./binding'),","    Directive   = require('./directive'),","    TextParser  = require('./text-parser'),","    DepsParser  = require('./deps-parser'),","    ExpParser   = require('./exp-parser'),","    transition  = require('./transition'),","    // cache deps ob","    depsOb      = DepsParser.observer,","    // cache methods","    slice       = Array.prototype.slice,","    log         = utils.log,","    makeHash    = utils.hash,","    def         = utils.defProtected,","    hasOwn      = Object.prototype.hasOwnProperty","","/**"," *  The DOM compiler"," *  scans a DOM node and compile bindings for a ViewModel"," */","function Compiler (vm, options) {","","    var compiler = this","","    // indicate that we are intiating this instance","    // so we should not run any transitions","    compiler.init = true","","    // extend options","    options = compiler.options = options || makeHash()","    utils.processOptions(options)","    utils.extend(compiler, options.compilerOptions)","","    // initialize element","    var el = compiler.setupElement(options)","    log('\\nnew VM instance:', el.tagName, '\\n')","","    // copy scope properties to vm","    var scope = options.scope","    if (scope) utils.extend(vm, scope, true)","","    compiler.vm  = vm","    def(vm, '$', makeHash())","    def(vm, '$el', el)","    def(vm, '$compiler', compiler)","","    // keep track of directives and expressions","    // so they can be unbound during destroy()","    compiler.dirs = []","    compiler.exps = []","    compiler.childCompilers = [] // keep track of child compilers","    compiler.emitter = new Emitter() // the emitter used for nested VM communication","","    // Store things during parsing to be processed afterwards,","    // because we want to have created all bindings before","    // observing values / parsing dependencies.","    var observables = compiler.observables = [],","        computed    = compiler.computed    = []","","    // prototypal inheritance of bindings","    var parent = compiler.parentCompiler","    compiler.bindings = parent","        ? Object.create(parent.bindings)","        : makeHash()","    compiler.rootCompiler = parent","        ? getRoot(parent)","        : compiler","","    // set parent VM","    // and register child id on parent","    var childId = utils.attr(el, 'id')","    if (parent) {","        def(vm, '$parent', parent.vm)","        if (childId) {","            compiler.childId = childId","            parent.vm.$[childId] = vm","        }","    }","","    // setup observer","    compiler.setupObserver()","","    // call user init. this will capture some initial values.","    if (options.init) {","        options.init.apply(vm, options.args || [])","    }","","    // create bindings for keys set on the vm by the user","    var key, keyPrefix","    for (key in vm) {","        keyPrefix = key.charAt(0)","        if (keyPrefix !== '$' && keyPrefix !== '_') {","            compiler.createBinding(key)","        }","    }","","    // for repeated items, create an index binding","    // which should be inenumerable but configurable","    if (compiler.repeat) {","        vm.$index = compiler.repeatIndex","        def(vm, '$collection', compiler.repeatCollection)","        compiler.createBinding('$index')","    }","","    // now parse the DOM, during which we will create necessary bindings","    // and bind the parsed directives","    compiler.compile(el, true)","","    // observe root values so that they emit events when","    // their nested values change (for an Object)","    // or when they mutate (for an Array)","    var i = observables.length, binding","    while (i--) {","        binding = observables[i]","        Observer.observe(binding.value, binding.key, compiler.observer)","    }","    // extract dependencies for computed properties","    if (computed.length) DepsParser.parse(computed)","","    // done!","    compiler.init = false","}","","var CompilerProto = Compiler.prototype","","/**"," *  Initialize the VM/Compiler's element."," *  Fill it in with the template if necessary."," */","CompilerProto.setupElement = function (options) {","    // create the node first","    var el = this.el = typeof options.el === 'string'","        ? document.querySelector(options.el)","        : options.el || document.createElement(options.tagName || 'div')","","    var template = options.template","    if (template) {","        // replace option: use the first node in","        // the template directly","        if (options.replace && template.childNodes.length === 1) {","            var replacer = template.childNodes[0].cloneNode(true)","            if (el.parentNode) {","                el.parentNode.insertBefore(replacer, el)","                el.parentNode.removeChild(el)","            }","            el = replacer","        } else {","            el.innerHTML = ''","            el.appendChild(template.cloneNode(true))","        }","    }","","    // apply element options","    if (options.id) el.id = options.id","    if (options.className) el.className = options.className","    var attrs = options.attributes","    if (attrs) {","        for (var attr in attrs) {","            el.setAttribute(attr, attrs[attr])","        }","    }","","    return el","}","","/**"," *  Setup observer."," *  The observer listens for get/set/mutate events on all VM"," *  values/objects and trigger corresponding binding updates."," */","CompilerProto.setupObserver = function () {","","    var compiler = this,","        bindings = compiler.bindings,","        observer = compiler.observer = new Emitter()","","    // a hash to hold event proxies for each root level key","    // so they can be referenced and removed later","    observer.proxies = makeHash()","","    // add own listeners which trigger binding updates","    observer","        .on('get', function (key) {","            check(key)","            depsOb.emit('get', bindings[key])","        })","        .on('set', function (key, val) {","            observer.emit('change:' + key, val)","            check(key)","            bindings[key].update(val)","        })","        .on('mutate', function (key, val, mutation) {","            observer.emit('change:' + key, val, mutation)","            check(key)","            bindings[key].pub()","        })","","    function check (key) {","        if (!bindings[key]) {","            compiler.createBinding(key)","        }","    }","}","","/**"," *  Compile a DOM node (recursive)"," */","CompilerProto.compile = function (node, root) {","","    var compiler = this","","    if (node.nodeType === 1) { // a normal node","","        // skip anything with v-pre","        if (utils.attr(node, 'pre') !== null) return","","        // special attributes to check","        var repeatExp,","            componentId,","            partialId,","            customElementFn = compiler.getOption('elements', node.tagName.toLowerCase())","","        // It is important that we access these attributes","        // procedurally because the order matters.","        //","        // `utils.attr` removes the attribute once it gets the","        // value, so we should not access them all at once.","","        // v-repeat has the highest priority","        // and we need to preserve all other attributes for it.","        /* jshint boss: true */","        if (repeatExp = utils.attr(node, 'repeat')) {","","            // repeat block cannot have v-id at the same time.","            var directive = Directive.parse(config.attrs.repeat, repeatExp, compiler, node)","            if (directive) {","                compiler.bindDirective(directive)","            }","","        // custom elements has 2nd highest priority","        } else if (!root && customElementFn) {","","            addChild(customElementFn)","","        // v-component has 3rd highest priority","        } else if (!root && (componentId = utils.attr(node, 'component'))) {","","            var ChildVM = compiler.getOption('components', componentId)","            if (ChildVM) addChild(ChildVM)","","        } else {","","            // check transition property","            node.vue_trans = utils.attr(node, 'transition')","            ","            // replace innerHTML with partial","            partialId = utils.attr(node, 'partial')","            if (partialId) {","                var partial = compiler.getOption('partials', partialId)","                if (partial) {","                    node.innerHTML = ''","                    node.appendChild(partial.cloneNode(true))","                }","            }","","            // finally, only normal directives left!","            compiler.compileNode(node)","        }","","    } else if (node.nodeType === 3) { // text node","","        compiler.compileTextNode(node)","","    }","","    function addChild (Ctor) {","        if (utils.isConstructor(Ctor)) {","            var child = new Ctor({","                el: node,","                child: true,","                compilerOptions: {","                    parentCompiler: compiler","                }","            })","            compiler.childCompilers.push(child.$compiler)","        } else {","            // simply call the function","            Ctor(node)","        }","    }","}","","/**"," *  Compile a normal node"," */","CompilerProto.compileNode = function (node) {","    var i, j, attrs = node.attributes","    // parse if has attributes","    if (attrs && attrs.length) {","        var attr, valid, exps, exp","        // loop through all attributes","        i = attrs.length","        while (i--) {","            attr = attrs[i]","            valid = false","            exps = Directive.split(attr.value)","            // loop through clauses (separated by \",\")","            // inside each attribute","            j = exps.length","            while (j--) {","                exp = exps[j]","                var directive = Directive.parse(attr.name, exp, this, node)","                if (directive) {","                    valid = true","                    this.bindDirective(directive)","                }","            }","            if (valid) node.removeAttribute(attr.name)","        }","    }","    // recursively compile childNodes","    if (node.childNodes.length) {","        var nodes = slice.call(node.childNodes)","        for (i = 0, j = nodes.length; i < j; i++) {","            this.compile(nodes[i])","        }","    }","}","","/**"," *  Compile a text node"," */","CompilerProto.compileTextNode = function (node) {","    var tokens = TextParser.parse(node.nodeValue)","    if (!tokens) return","    var dirname = config.attrs.text,","        el, token, directive","    for (var i = 0, l = tokens.length; i < l; i++) {","        token = tokens[i]","        if (token.key) { // a binding","            if (token.key.charAt(0) === '>') { // a partial","                var partialId = token.key.slice(1).trim(),","                    partial = this.getOption('partials', partialId)","                if (partial) {","                    el = partial.cloneNode(true)","                    this.compileNode(el)","                }","            } else { // a binding","                el = document.createTextNode('')","                directive = Directive.parse(dirname, token.key, this, el)","                if (directive) {","                    this.bindDirective(directive)","                }","            }","        } else { // a plain string","            el = document.createTextNode(token)","        }","        node.parentNode.insertBefore(el, node)","    }","    node.parentNode.removeChild(node)","}","","/**"," *  Add a directive instance to the correct binding & viewmodel"," */","CompilerProto.bindDirective = function (directive) {","","    // keep track of it so we can unbind() later","    this.dirs.push(directive)","","    // for a simple directive, simply call its bind() or _update()","    // and we're done.","    if (directive.isSimple) {","        if (directive.bind) directive.bind()","        return","    }","","    // otherwise, we got more work to do...","    var binding,","        compiler      = this,","        key           = directive.key,","        baseKey       = key.split('.')[0],","        ownerCompiler = traceOwnerCompiler(directive, compiler)","","    if (directive.isExp) {","        // expression bindings are always created on current compiler","        binding = compiler.createBinding(key, true, directive.isFn)","    } else if (ownerCompiler.vm.hasOwnProperty(baseKey)) {","        // If the directive's owner compiler's VM has the key,","        // it belongs there. Create the binding if it's not already","        // created, and return it.","        binding = hasOwn.call(ownerCompiler.bindings, key)","            ? ownerCompiler.bindings[key]","            : ownerCompiler.createBinding(key)","    } else {","        // due to prototypal inheritance of bindings, if a key doesn't exist","        // on the owner compiler's VM, then it doesn't exist in the whole","        // prototype chain. In this case we create the new binding at the root level.","        binding = ownerCompiler.bindings[key] || compiler.rootCompiler.createBinding(key)","    }","","    binding.instances.push(directive)","    directive.binding = binding","","    var value = binding.value","    // invoke bind hook if exists","    if (directive.bind) {","        directive.bind(value)","    }","","    // set initial value","    if (value !== undefined) {","        if (binding.isComputed) {","            directive.refresh(value)","        } else {","            directive.update(value, true)","        }","    }","}","","/**"," *  Create binding and attach getter/setter for a key to the viewmodel object"," */","CompilerProto.createBinding = function (key, isExp, isFn) {","","    var compiler = this,","        bindings = compiler.bindings,","        binding  = new Binding(compiler, key, isExp, isFn)","","    if (isExp) {","        // a complex expression binding","        // we need to generate an anonymous computed property for it","        var getter = ExpParser.parse(key, compiler)","        if (getter) {","            log('  created expression binding: ' + key)","            binding.value = isFn","                ? getter","                : { $get: getter }","            compiler.markComputed(binding)","            compiler.exps.push(binding)","        }","    } else {","        log('  created binding: ' + key)","        bindings[key] = binding","        // make sure the key exists in the object so it can be observed","        // by the Observer!","        Observer.ensurePath(compiler.vm, key)","        if (binding.root) {","            // this is a root level binding. we need to define getter/setters for it.","            compiler.define(key, binding)","        } else {","            var parentKey = key.slice(0, key.lastIndexOf('.'))","            if (!hasOwn.call(bindings, parentKey)) {","                // this is a nested value binding, but the binding for its parent","                // has not been created yet. We better create that one too.","                compiler.createBinding(parentKey)","            }","        }","    }","    return binding","}","","/**"," *  Defines the getter/setter for a root-level binding on the VM"," *  and observe the initial value"," */","CompilerProto.define = function (key, binding) {","","    log('    defined root binding: ' + key)","","    var compiler = this,","        vm = compiler.vm,","        ob = compiler.observer,","        value = binding.value = vm[key], // save the value before redefinening it","        type = utils.typeOf(value)","","    if (type === 'Object' && value.$get) {","        // computed property","        compiler.markComputed(binding)","    } else if (type === 'Object' || type === 'Array') {","        // observe objects later, becase there might be more keys","        // to be added to it. we also want to emit all the set events","        // after all values are available.","        compiler.observables.push(binding)","    }","","    Object.defineProperty(vm, key, {","        enumerable: true,","        get: function () {","            var value = binding.value","            if (depsOb.active && (!binding.isComputed && (!value || !value.__observer__)) ||","                Array.isArray(value)) {","                // only emit non-computed, non-observed (primitive) values, or Arrays.","                // because these are the cleanest dependencies","                ob.emit('get', key)","            }","            return binding.isComputed","                ? value.$get()","                : value","        },","        set: function (newVal) {","            var value = binding.value","            if (binding.isComputed) {","                if (value.$set) {","                    value.$set(newVal)","                }","            } else if (newVal !== value) {","                // unwatch the old value","                Observer.unobserve(value, key, ob)","                // set new value","                binding.value = newVal","                ob.emit('set', key, newVal)","                Observer.ensurePaths(key, newVal, compiler.bindings)","                // now watch the new value, which in turn emits 'set'","                // for all its nested values","                Observer.observe(newVal, key, ob)","            }","        }","    })","}","","/**"," *  Process a computed property binding"," */","CompilerProto.markComputed = function (binding) {","    var value = binding.value,","        vm    = this.vm","    binding.isComputed = true","    // bind the accessors to the vm","    if (binding.isFn) {","        binding.value = utils.bind(value, vm)","    } else {","        value.$get = utils.bind(value.$get, vm)","        if (value.$set) {","            value.$set = utils.bind(value.$set, vm)","        }","    }","    // keep track for dep parsing later","    this.computed.push(binding)","}","","/**"," *  Retrive an option from the compiler"," */","CompilerProto.getOption = function (type, id) {","    var opts = this.options","    return (opts[type] && opts[type][id]) || (utils[type] && utils[type][id])","}","","/**"," *  Unbind and remove element"," */","CompilerProto.destroy = function () {","","    var compiler = this,","        i, key, dir, instances, binding,","        el         = compiler.el,","        directives = compiler.dirs,","        exps       = compiler.exps,","        bindings   = compiler.bindings,","        teardown   = compiler.options.teardown","","    // call user teardown first","    if (teardown) teardown()","","    // unwatch","    compiler.observer.off()","    compiler.emitter.off()","","    // unbind all direcitves","    i = directives.length","    while (i--) {","        dir = directives[i]","        // if this directive is an instance of an external binding","        // e.g. a directive that refers to a variable on the parent VM","        // we need to remove it from that binding's instances","        if (!dir.isSimple && dir.binding.compiler !== compiler) {","            instances = dir.binding.instances","            if (instances) instances.splice(instances.indexOf(dir), 1)","        }","        dir.unbind()","    }","","    // unbind all expressions (anonymous bindings)","    i = exps.length","    while (i--) {","        exps[i].unbind()","    }","","    // unbind/unobserve all own bindings","    for (key in bindings) {","        if (hasOwn.call(bindings, key)) {","            binding = bindings[key]","            if (binding.root) {","                Observer.unobserve(binding.value, binding.key, compiler.observer)","            }","            binding.unbind()","        }","    }","","    // remove self from parentCompiler","    var parent = compiler.parentCompiler,","        childId = compiler.childId","    if (parent) {","        parent.childCompilers.splice(parent.childCompilers.indexOf(compiler), 1)","        if (childId) {","            delete parent.vm.$[childId]","        }","    }","","    // finally remove dom element","    if (el === document.body) {","        el.innerHTML = ''","    } else if (el.parentNode) {","        transition(el, -1, function () {","            el.parentNode.removeChild(el)","        }, this)","    }","}","","// Helpers --------------------------------------------------------------------","","/**"," *  determine which viewmodel a key belongs to based on nesting symbols"," */","function traceOwnerCompiler (key, compiler) {","    if (key.nesting) {","        var levels = key.nesting","        while (compiler.parentCompiler && levels--) {","            compiler = compiler.parentCompiler","        }","    } else if (key.root) {","        while (compiler.parentCompiler) {","            compiler = compiler.parentCompiler","        }","    }","    return compiler","}","","/**"," *  shorthand for getting root compiler"," */","function getRoot (compiler) {","    return traceOwnerCompiler({ root: true }, compiler)","}","","module.exports = Compiler","});","require.register(\"vue/src/viewmodel.js\", function(exports, require, module){","var Compiler = require('./compiler'),","    def      = require('./utils').defProtected","","/**"," *  ViewModel exposed to the user that holds data,"," *  computed properties, event handlers"," *  and a few reserved methods"," */","function ViewModel (options) {","    // just compile. options are passed directly to compiler","    new Compiler(this, options)","}","","// All VM prototype methods are inenumerable","// so it can be stringified/looped through as raw data","var VMProto = ViewModel.prototype","","/**"," *  Convenience function to set an actual nested value"," *  from a flat key string. Used in directives."," */","def(VMProto, '$set', function (key, value) {","    var path = key.split('.'),","        obj = getTargetVM(this, path)","    if (!obj) return","    for (var d = 0, l = path.length - 1; d < l; d++) {","        obj = obj[path[d]]","    }","    obj[path[d]] = value","})","","/**"," *  watch a key on the viewmodel for changes"," *  fire callback with new value"," */","def(VMProto, '$watch', function (key, callback) {","    this.$compiler.observer.on('change:' + key, callback)","})","","/**"," *  unwatch a key"," */","def(VMProto, '$unwatch', function (key, callback) {","    // workaround here","    // since the emitter module checks callback existence","    // by checking the length of arguments","    var args = ['change:' + key],","        ob = this.$compiler.observer","    if (callback) args.push(callback)","    ob.off.apply(ob, args)","})","","/**"," *  unbind everything, remove everything"," */","def(VMProto, '$destroy', function () {","    this.$compiler.destroy()","})","","/**"," *  broadcast an event to all child VMs recursively."," */","def(VMProto, '$broadcast', function () {","    var children = this.$compiler.childCompilers,","        i = children.length,","        child","    while (i--) {","        child = children[i]","        child.emitter.emit.apply(child.emitter, arguments)","        child.vm.$broadcast.apply(child.vm, arguments)","    }","})","","/**"," *  emit an event that propagates all the way up to parent VMs."," */","def(VMProto, '$emit', function () {","    var compiler = this.$compiler,","        emitter = compiler.emitter,","        parent = compiler.parentCompiler","    emitter.emit.apply(emitter, arguments)","    if (parent) {","        parent.emitter.emit.apply(parent.emitter, arguments)","        parent.vm.$emit.apply(parent.vm, arguments)","    }","})","","/**"," *  delegate on/off/once to the compiler's emitter"," */",";['on', 'off', 'once'].forEach(function (method) {","    def(VMProto, '$' + method, function () {","        var emitter = this.$compiler.emitter","        emitter[method].apply(emitter, arguments)","    })","})","","/**"," *  If a VM doesn't contain a path, go up the prototype chain"," *  to locate the ancestor that has it."," */","function getTargetVM (vm, path) {","    var baseKey = path[0],","        binding = vm.$compiler.bindings[baseKey]","    return binding","        ? binding.compiler.vm","        : null","}","","module.exports = ViewModel","});","require.register(\"vue/src/binding.js\", function(exports, require, module){","/**"," *  Binding class."," *"," *  each property on the viewmodel has one corresponding Binding object"," *  which has multiple directive instances on the DOM"," *  and multiple computed property dependents"," */","function Binding (compiler, key, isExp, isFn) {","    this.value = undefined","    this.isExp = !!isExp","    this.isFn = isFn","    this.root = !this.isExp && key.indexOf('.') === -1","    this.compiler = compiler","    this.key = key","    this.instances = []","    this.subs = []","    this.deps = []","}","","var BindingProto = Binding.prototype","","/**"," *  Process the value, then trigger updates on all dependents"," */","BindingProto.update = function (value) {","    this.value = value","    var i = this.instances.length","    while (i--) {","        this.instances[i].update(value)","    }","    this.pub()","}","","/**"," *  -- computed property only --    "," *  Force all instances to re-evaluate themselves"," */","BindingProto.refresh = function () {","    var i = this.instances.length","    while (i--) {","        this.instances[i].refresh()","    }","    this.pub()","}","","/**"," *  Notify computed properties that depend on this binding"," *  to update themselves"," */","BindingProto.pub = function () {","    var i = this.subs.length","    while (i--) {","        this.subs[i].refresh()","    }","}","","/**"," *  Unbind the binding, remove itself from all of its dependencies"," */","BindingProto.unbind = function () {","    var i = this.instances.length","    while (i--) {","        this.instances[i].unbind()","    }","    i = this.deps.length","    var subs","    while (i--) {","        subs = this.deps[i].subs","        subs.splice(subs.indexOf(this), 1)","    }","}","","module.exports = Binding","});","require.register(\"vue/src/observer.js\", function(exports, require, module){","/* jshint proto:true */","","var Emitter  = require('./emitter'),","    utils    = require('./utils'),","    depsOb   = require('./deps-parser').observer,","","    // cache methods","    typeOf   = utils.typeOf,","    def      = utils.defProtected,","    slice    = Array.prototype.slice,","","    // Array mutation methods to wrap","    methods  = ['push','pop','shift','unshift','splice','sort','reverse'],","","    // fix for IE + __proto__ problem","    // define methods as inenumerable if __proto__ is present,","    // otherwise enumerable so we can loop through and manually","    // attach to array instances","    hasProto = ({}).__proto__","","// The proxy prototype to replace the __proto__ of","// an observed array","var ArrayProxy = Object.create(Array.prototype)","","// Define mutation interceptors so we can emit the mutation info","methods.forEach(function (method) {","    def(ArrayProxy, method, function () {","        var result = Array.prototype[method].apply(this, arguments)","        this.__observer__.emit('mutate', this.__observer__.path, this, {","            method: method,","            args: slice.call(arguments),","            result: result","        })","        return result","    }, !hasProto)","})","","// Augment it with several convenience methods","var extensions = {","    remove: function (index) {","        if (typeof index === 'function') {","            var i = this.length,","                removed = []","            while (i--) {","                if (index(this[i])) {","                    removed.push(this.splice(i, 1)[0])","                }","            }","            return removed.reverse()","        } else {","            if (typeof index !== 'number') {","                index = this.indexOf(index)","            }","            if (index > -1) {","                return this.splice(index, 1)[0]","            }","        }","    },","    replace: function (index, data) {","        if (typeof index === 'function') {","            var i = this.length,","                replaced = [],","                replacer","            while (i--) {","                replacer = index(this[i])","                if (replacer !== undefined) {","                    replaced.push(this.splice(i, 1, replacer)[0])","                }","            }","            return replaced.reverse()","        } else {","            if (typeof index !== 'number') {","                index = this.indexOf(index)","            }","            if (index > -1) {","                return this.splice(index, 1, data)[0]","            }","        }","    }","}","","for (var method in extensions) {","    def(ArrayProxy, method, extensions[method], !hasProto)","}","","/**"," *  Watch an object based on type"," */","function watch (obj, path, observer) {","    var type = typeOf(obj)","    if (type === 'Object') {","        watchObject(obj, path, observer)","    } else if (type === 'Array') {","        watchArray(obj, path, observer)","    }","}","","/**"," *  Watch an Object, recursive."," */","function watchObject (obj, path, observer) {","    for (var key in obj) {","        var keyPrefix = key.charAt(0)","        if (keyPrefix !== '$' && keyPrefix !== '_') {","            bind(obj, key, path, observer)","        }","    }","}","","/**"," *  Watch an Array, overload mutation methods"," *  and add augmentations by intercepting the prototype chain"," */","function watchArray (arr, path, observer) {","    def(arr, '__observer__', observer)","    observer.path = path","    if (hasProto) {","        arr.__proto__ = ArrayProxy","    } else {","        for (var key in ArrayProxy) {","            def(arr, key, ArrayProxy[key])","        }","    }","}","","/**"," *  Define accessors for a property on an Object"," *  so it emits get/set events."," *  Then watch the value itself."," */","function bind (obj, key, path, observer) {","    var val       = obj[key],","        watchable = isWatchable(val),","        values    = observer.values,","        fullKey   = (path ? path + '.' : '') + key","    values[fullKey] = val","    // emit set on bind","    // this means when an object is observed it will emit","    // a first batch of set events.","    observer.emit('set', fullKey, val)","    Object.defineProperty(obj, key, {","        enumerable: true,","        get: function () {","            // only emit get on tip values","            if (depsOb.active && !watchable) {","                observer.emit('get', fullKey)","            }","            return values[fullKey]","        },","        set: function (newVal) {","            values[fullKey] = newVal","            ensurePaths(key, newVal, values)","            observer.emit('set', fullKey, newVal)","            watch(newVal, fullKey, observer)","        }","    })","    watch(val, fullKey, observer)","}","","/**"," *  Check if a value is watchable"," */","function isWatchable (obj) {","    var type = typeOf(obj)","    return type === 'Object' || type === 'Array'","}","","/**"," *  When a value that is already converted is"," *  observed again by another observer, we can skip"," *  the watch conversion and simply emit set event for"," *  all of its properties."," */","function emitSet (obj, observer, set) {","    if (typeOf(obj) === 'Array') {","        set('length', obj.length)","    } else {","        var key, val, values = observer.values","        for (key in observer.values) {","            val = values[key]","            set(key, val)","        }","    }","}","","/**"," *  Sometimes when a binding is found in the template, the value might"," *  have not been set on the VM yet. To ensure computed properties and"," *  dependency extraction can work, we have to create a dummy value for"," *  any given path."," */","function ensurePaths (key, val, paths) {","    key += '.'","    for (var path in paths) {","        if (!path.indexOf(key)) {","            ensurePath(val, path.replace(key, ''))","        }","    }","}","","/**"," *  walk along a path and make sure it can be accessed"," *  and enumerated in that object"," */","function ensurePath (obj, key) {","    if (typeOf(obj) !== 'Object') return","    var path = key.split('.'), sec","    for (var i = 0, d = path.length - 1; i < d; i++) {","        sec = path[i]","        if (!obj[sec]) obj[sec] = {}","        obj = obj[sec]","    }","    if (typeOf(obj) === 'Object') {","        sec = path[i]","        if (!(sec in obj)) obj[sec] = undefined","    }","}","","module.exports = {","","    // used in v-repeat","    watchArray: watchArray,","    ensurePath: ensurePath,","    ensurePaths: ensurePaths,","","    /**","     *  Observe an object with a given path,","     *  and proxy get/set/mutate events to the provided observer.","     */","    observe: function (obj, rawPath, observer) {","        if (isWatchable(obj)) {","            var path = rawPath + '.',","                ob, alreadyConverted = !!obj.__observer__","            if (!alreadyConverted) {","                def(obj, '__observer__', new Emitter())","            }","            ob = obj.__observer__","            ob.values = ob.values || utils.hash()","            var proxies = observer.proxies[path] = {","                get: function (key) {","                    observer.emit('get', path + key)","                },","                set: function (key, val) {","                    observer.emit('set', path + key, val)","                },","                mutate: function (key, val, mutation) {","                    // if the Array is a root value","                    // the key will be null","                    var fixedPath = key ? path + key : rawPath","                    observer.emit('mutate', fixedPath, val, mutation)","                    // also emit set for Array's length when it mutates","                    var m = mutation.method","                    if (m !== 'sort' && m !== 'reverse') {","                        observer.emit('set', fixedPath + '.length', val.length)","                    }","                }","            }","            ob","                .on('get', proxies.get)","                .on('set', proxies.set)","                .on('mutate', proxies.mutate)","            if (alreadyConverted) {","                emitSet(obj, ob, proxies.set)","            } else {","                watch(obj, null, ob)","            }","        }","    },","","    /**","     *  Cancel observation, turn off the listeners.","     */","    unobserve: function (obj, path, observer) {","        if (!obj || !obj.__observer__) return","        path = path + '.'","        var proxies = observer.proxies[path]","        obj.__observer__","            .off('get', proxies.get)","            .off('set', proxies.set)","            .off('mutate', proxies.mutate)","        observer.proxies[path] = null","    }","}","});","require.register(\"vue/src/directive.js\", function(exports, require, module){","var config     = require('./config'),","    utils      = require('./utils'),","    directives = require('./directives'),","    filters    = require('./filters'),","","    // Regexes!","","    // regex to split multiple directive expressions","    // split by commas, but ignore commas within quotes, parens and escapes.","    SPLIT_RE        = /(?:['\"](?:\\\\.|[^'\"])*['\"]|\\((?:\\\\.|[^\\)])*\\)|\\\\.|[^,])+/g,","","    // match up to the first single pipe, ignore those within quotes.","    KEY_RE          = /^(?:['\"](?:\\\\.|[^'\"])*['\"]|\\\\.|[^\\|]|\\|\\|)+/,","","    ARG_RE          = /^([\\w- ]+):(.+)$/,","    FILTERS_RE      = /\\|[^\\|]+/g,","    FILTER_TOKEN_RE = /[^\\s']+|'[^']+'/g,","    NESTING_RE      = /^\\^+/,","    SINGLE_VAR_RE   = /^[\\w\\.\\$]+$/","","/**"," *  Directive class"," *  represents a single directive instance in the DOM"," */","function Directive (definition, expression, rawKey, compiler, node) {","","    this.compiler = compiler","    this.vm       = compiler.vm","    this.el       = node","","    var isSimple  = expression === ''","","    // mix in properties from the directive definition","    if (typeof definition === 'function') {","        this[isSimple ? 'bind' : '_update'] = definition","    } else {","        for (var prop in definition) {","            if (prop === 'unbind' || prop === 'update') {","                this['_' + prop] = definition[prop]","            } else {","                this[prop] = definition[prop]","            }","        }","    }","","    // empty expression, we're done.","    if (isSimple) {","        this.isSimple = true","        return","    }","","    this.expression = expression.trim()","    this.rawKey     = rawKey","    ","    parseKey(this, rawKey)","","    this.isExp = !SINGLE_VAR_RE.test(this.key)","    ","    var filterExps = this.expression.slice(rawKey.length).match(FILTERS_RE)","    if (filterExps) {","        this.filters = []","        var i = 0, l = filterExps.length, filter","        for (; i < l; i++) {","            filter = parseFilter(filterExps[i], this.compiler)","            if (filter) this.filters.push(filter)","        }","        if (!this.filters.length) this.filters = null","    } else {","        this.filters = null","    }","}","","var DirProto = Directive.prototype","","/**"," *  parse a key, extract argument and nesting/root info"," */","function parseKey (dir, rawKey) {","","    var key = rawKey","    if (rawKey.indexOf(':') > -1) {","        var argMatch = rawKey.match(ARG_RE)","        key = argMatch","            ? argMatch[2].trim()","            : key","        dir.arg = argMatch","            ? argMatch[1].trim()","            : null","    }","","    // nesting","    var firstChar = key.charAt(0)","    dir.root = firstChar === '*'","    dir.nesting = firstChar === '^'","        ? key.match(NESTING_RE)[0].length","        : false","","    if (dir.nesting) {","        key = key.slice(dir.nesting)","    } else if (dir.root) {","        key = key.slice(1)","    }","","    dir.key = key","}","","/**"," *  parse a filter expression"," */","function parseFilter (filter, compiler) {","","    var tokens = filter.slice(1).match(FILTER_TOKEN_RE)","    if (!tokens) return","    tokens = tokens.map(function (token) {","        return token.replace(/'/g, '').trim()","    })","","    var name = tokens[0],","        apply = compiler.getOption('filters', name) || filters[name]","    if (!apply) {","        utils.warn('Unknown filter: ' + name)","        return","    }","","    return {","        name  : name,","        apply : apply,","        args  : tokens.length > 1","                ? tokens.slice(1)","                : null","    }","}","","/**"," *  called when a new value is set "," *  for computed properties, this will only be called once"," *  during initialization."," */","DirProto.update = function (value, init) {","    if (!init && value === this.value) return","    this.value = value","    this.apply(value)","}","","/**"," *  -- computed property only --"," *  called when a dependency has changed"," */","DirProto.refresh = function (value) {","    // pass element and viewmodel info to the getter","    // enables context-aware bindings","    if (value) this.value = value","","    if (this.isFn) {","        value = this.value","    } else {","        value = this.value.$get()","        if (value !== undefined && value === this.computedValue) return","        this.computedValue = value","    }","    this.apply(value)","}","","/**"," *  Actually invoking the _update from the directive's definition"," */","DirProto.apply = function (value) {","    this._update(","        this.filters","            ? this.applyFilters(value)","            : value","    )","}","","/**"," *  pipe the value through filters"," */","DirProto.applyFilters = function (value) {","    var filtered = value, filter","    for (var i = 0, l = this.filters.length; i < l; i++) {","        filter = this.filters[i]","        filtered = filter.apply.call(this.vm, filtered, filter.args)","    }","    return filtered","}","","/**"," *  Unbind diretive"," *  @ param {Boolean} update"," *    Sometimes we call unbind before an update (i.e. not destroy)"," *    just to teardown previous stuff, in that case we do not want"," *    to null everything."," */","DirProto.unbind = function (update) {","    // this can be called before the el is even assigned...","    if (!this.el) return","    if (this._unbind) this._unbind(update)","    if (!update) this.vm = this.el = this.binding = this.compiler = null","}","","// exposed methods ------------------------------------------------------------","","/**"," *  split a unquoted-comma separated expression into"," *  multiple clauses"," */","Directive.split = function (exp) {","    return exp.indexOf(',') > -1","        ? exp.match(SPLIT_RE) || ['']","        : [exp]","}","","/**"," *  make sure the directive and expression is valid"," *  before we create an instance"," */","Directive.parse = function (dirname, expression, compiler, node) {","","    var prefix = config.prefix + '-'","    if (dirname.indexOf(prefix) !== 0) return","    dirname = dirname.slice(prefix.length)","","    var dir = compiler.getOption('directives', dirname) || directives[dirname]","    if (!dir) return utils.warn('unknown directive: ' + dirname)","","    var rawKey","    if (expression.indexOf('|') > -1) {","        var keyMatch = expression.match(KEY_RE)","        if (keyMatch) {","            rawKey = keyMatch[0].trim()","        }","    } else {","        rawKey = expression.trim()","    }","    ","    // have a valid raw key, or be an empty directive","    return (rawKey || expression === '')","        ? new Directive(dir, expression, rawKey, compiler, node)","        : utils.warn('invalid directive expression: ' + expression)","}","","module.exports = Directive","});","require.register(\"vue/src/exp-parser.js\", function(exports, require, module){","var utils = require('./utils'),","    hasOwn = Object.prototype.hasOwnProperty","","// Variable extraction scooped from https://github.com/RubyLouvre/avalon","","var KEYWORDS =","        // keywords","        'break,case,catch,continue,debugger,default,delete,do,else,false' +","        ',finally,for,function,if,in,instanceof,new,null,return,switch,this' +","        ',throw,true,try,typeof,var,void,while,with,undefined' +","        // reserved","        ',abstract,boolean,byte,char,class,const,double,enum,export,extends' +","        ',final,float,goto,implements,import,int,interface,long,native' +","        ',package,private,protected,public,short,static,super,synchronized' +","        ',throws,transient,volatile' +","        // ECMA 5 - use strict","        ',arguments,let,yield' +","        // allow using Math in expressions","        ',Math',","        ","    KEYWORDS_RE = new RegExp([\"\\\\b\" + KEYWORDS.replace(/,/g, '\\\\b|\\\\b') + \"\\\\b\"].join('|'), 'g'),","    REMOVE_RE   = /\\/\\*(?:.|\\n)*?\\*\\/|\\/\\/[^\\n]*\\n|\\/\\/[^\\n]*$|'[^']*'|\"[^\"]*\"|[\\s\\t\\n]*\\.[\\s\\t\\n]*[$\\w\\.]+/g,","    SPLIT_RE    = /[^\\w$]+/g,","    NUMBER_RE   = /\\b\\d[^,]*/g,","    BOUNDARY_RE = /^,+|,+$/g","","/**"," *  Strip top level variable names from a snippet of JS expression"," */","function getVariables (code) {","    code = code","        .replace(REMOVE_RE, '')","        .replace(SPLIT_RE, ',')","        .replace(KEYWORDS_RE, '')","        .replace(NUMBER_RE, '')","        .replace(BOUNDARY_RE, '')","    return code","        ? code.split(/,+/)","        : []","}","","/**"," *  A given path could potentially exist not on the"," *  current compiler, but up in the parent chain somewhere."," *  This function generates an access relationship string"," *  that can be used in the getter function by walking up"," *  the parent chain to check for key existence."," *"," *  It stops at top parent if no vm in the chain has the"," *  key. It then creates any missing bindings on the"," *  final resolved vm."," */","function getRel (path, compiler) {","    var rel = '',","        vm  = compiler.vm,","        dot = path.indexOf('.'),","        key = dot > -1","            ? path.slice(0, dot)","            : path","    while (true) {","        if (hasOwn.call(vm, key)) {","            break","        } else {","            if (vm.$parent) {","                vm = vm.$parent","                rel += '$parent.'","            } else {","                break","            }","        }","    }","    compiler = vm.$compiler","    if (","        !hasOwn.call(compiler.bindings, path) &&","        path.charAt(0) !== '$'","    ) {","        compiler.createBinding(path)","    }","    return rel","}","","/**"," *  Create a function from a string..."," *  this looks like evil magic but since all variables are limited"," *  to the VM's scope it's actually properly sandboxed"," */","function makeGetter (exp, raw) {","    /* jshint evil: true */","    var fn","    try {","        fn = new Function(exp)","    } catch (e) {","        utils.warn('Invalid expression: ' + raw)","    }","    return fn","}","","/**"," *  Escape a leading dollar sign for regex construction"," */","function escapeDollar (v) {","    return v.charAt(0) === '$'","        ? '\\\\' + v","        : v","}","","module.exports = {","","    /**","     *  Parse and return an anonymous computed property getter function","     *  from an arbitrary expression, together with a list of paths to be","     *  created as bindings.","     */","    parse: function (exp, compiler) {","        // extract variable names","        var vars = getVariables(exp)","        if (!vars.length) {","            return makeGetter('return ' + exp, exp)","        }","        vars = utils.unique(vars)","        var accessors = '',","            // construct a regex to extract all valid variable paths","            // ones that begin with \"$\" are particularly tricky","            // because we can't use \\b for them","            pathRE = new RegExp(","                \"[^$\\\\w\\\\.](\" +","                vars.map(escapeDollar).join('|') +","                \")[$\\\\w\\\\.]*\\\\b\", 'g'","            ),","            body = ('return ' + exp).replace(pathRE, function (path) {","                // keep track of the first char","                var c = path.charAt(0)","                path = path.slice(1)","                var val = 'this.' + getRel(path, compiler) + path","                accessors += val + ';'","                // don't forget to put that first char back","                return c + val","            })","        body = accessors + body","        return makeGetter(body, exp)","    }","}","});","require.register(\"vue/src/text-parser.js\", function(exports, require, module){","var BINDING_RE = /\\{\\{(.+?)\\}\\}/","","module.exports = {","","    /**","     *  Parse a piece of text, return an array of tokens","     */","    parse: function (text) {","        if (!BINDING_RE.test(text)) return null","        var m, i, tokens = []","        /* jshint boss: true */","        while (m = text.match(BINDING_RE)) {","            i = m.index","            if (i > 0) tokens.push(text.slice(0, i))","            tokens.push({ key: m[1].trim() })","            text = text.slice(i + m[0].length)","        }","        if (text.length) tokens.push(text)","        return tokens","    }","    ","}","});","require.register(\"vue/src/deps-parser.js\", function(exports, require, module){","var Emitter  = require('./emitter'),","    utils    = require('./utils'),","    observer = new Emitter()","","/**"," *  Auto-extract the dependencies of a computed property"," *  by recording the getters triggered when evaluating it."," */","function catchDeps (binding) {","    if (binding.isFn) return","    utils.log('\\n─ ' + binding.key)","    var depsHash = utils.hash()","    observer.on('get', function (dep) {","        if (depsHash[dep.key]) return","        depsHash[dep.key] = 1","        utils.log('  └─ ' + dep.key)","        binding.deps.push(dep)","        dep.subs.push(binding)","    })","    binding.value.$get()","    observer.off('get')","}","","module.exports = {","","    /**","     *  the observer that catches events triggered by getters","     */","    observer: observer,","","    /**","     *  parse a list of computed property bindings","     */","    parse: function (bindings) {","        utils.log('\\nparsing dependencies...')","        observer.active = true","        bindings.forEach(catchDeps)","        observer.active = false","        utils.log('\\ndone.')","    }","    ","}","});","require.register(\"vue/src/filters.js\", function(exports, require, module){","var keyCodes = {","    enter    : 13,","    tab      : 9,","    'delete' : 46,","    up       : 38,","    left     : 37,","    right    : 39,","    down     : 40,","    esc      : 27","}","","module.exports = {","","    /**","     *  'abc' => 'Abc'","     */","    capitalize: function (value) {","        if (!value && value !== 0) return ''","        value = value.toString()","        return value.charAt(0).toUpperCase() + value.slice(1)","    },","","    /**","     *  'abc' => 'ABC'","     */","    uppercase: function (value) {","        return (value || value === 0)","            ? value.toString().toUpperCase()","            : ''","    },","","    /**","     *  'AbC' => 'abc'","     */","    lowercase: function (value) {","        return (value || value === 0)","            ? value.toString().toLowerCase()","            : ''","    },","","    /**","     *  12345 => $12,345.00","     */","    currency: function (value, args) {","        if (!value && value !== 0) return ''","        var sign = (args && args[0]) || '$',","            s = Math.floor(value).toString(),","            i = s.length % 3,","            h = i > 0 ? (s.slice(0, i) + (s.length > 3 ? ',' : '')) : '',","            f = '.' + value.toFixed(2).slice(-2)","        return sign + h + s.slice(i).replace(/(\\d{3})(?=\\d)/g, '$1,') + f","    },","","    /**","     *  args: an array of strings corresponding to","     *  the single, double, triple ... forms of the word to","     *  be pluralized. When the number to be pluralized","     *  exceeds the length of the args, it will use the last","     *  entry in the array.","     *","     *  e.g. ['single', 'double', 'triple', 'multiple']","     */","    pluralize: function (value, args) {","        return args.length > 1","            ? (args[value - 1] || args[args.length - 1])","            : (args[value - 1] || args[0] + 's')","    },","","    /**","     *  A special filter that takes a handler function,","     *  wraps it so it only gets triggered on specific keypresses.","     */","    key: function (handler, args) {","        if (!handler) return","        var code = keyCodes[args[0]]","        if (!code) {","            code = parseInt(args[0], 10)","        }","        return function (e) {","            if (e.keyCode === code) {","                handler.call(this, e)","            }","        }","    }","}","});","require.register(\"vue/src/transition.js\", function(exports, require, module){","var endEvent   = sniffTransitionEndEvent(),","    config     = require('./config'),","    enterClass = config.enterClass,","    leaveClass = config.leaveClass,","    // exit codes for testing","    codes = {","        CSS_E     : 1,","        CSS_L     : 2,","        JS_E      : 3,","        JS_L      : 4,","        CSS_SKIP  : -1,","        JS_SKIP   : -2,","        JS_SKIP_E : -3,","        JS_SKIP_L : -4,","        INIT      : -5,","        SKIP      : -6","    }","","/**"," *  stage:"," *    1 = enter"," *    2 = leave"," */","var transition = module.exports = function (el, stage, changeState, compiler) {","","    if (compiler.init) {","        changeState()","        return codes.INIT","    }","","    var transitionId = el.vue_trans","","    if (transitionId) {","        return applyTransitionFunctions(","            el,","            stage,","            changeState,","            transitionId,","            compiler","        )","    } else if (transitionId === '') {","        return applyTransitionClass(","            el,","            stage,","            changeState","        )","    } else {","        changeState()","        return codes.SKIP","    }","","}","","transition.codes = codes","","/**"," *  Togggle a CSS class to trigger transition"," */","function applyTransitionClass (el, stage, changeState) {","","    if (!endEvent) {","        changeState()","        return codes.CSS_SKIP","    }","","    var classList         = el.classList,","        lastLeaveCallback = el.vue_trans_cb","","    if (stage > 0) { // enter","","        // cancel unfinished leave transition","        if (lastLeaveCallback) {","            el.removeEventListener(endEvent, lastLeaveCallback)","            el.vue_trans_cb = null","        }","","        // set to hidden state before appending","        classList.add(enterClass)","        // append","        changeState()","        // force a layout so transition can be triggered","        /* jshint unused: false */","        var forceLayout = el.clientHeight","        // trigger transition","        classList.remove(enterClass)","        return codes.CSS_E","","    } else { // leave","","        // trigger hide transition","        classList.add(leaveClass)","        var onEnd = function (e) {","            if (e.target === el) {","                el.removeEventListener(endEvent, onEnd)","                el.vue_trans_cb = null","                // actually remove node here","                changeState()","                classList.remove(leaveClass)","            }","        }","        // attach transition end listener","        el.addEventListener(endEvent, onEnd)","        el.vue_trans_cb = onEnd","        return codes.CSS_L","        ","    }","","}","","function applyTransitionFunctions (el, stage, changeState, functionId, compiler) {","","    var funcs = compiler.getOption('transitions', functionId)","    if (!funcs) {","        changeState()","        return codes.JS_SKIP","    }","","    var enter = funcs.enter,","        leave = funcs.leave","","    if (stage > 0) { // enter","        if (typeof enter !== 'function') {","            changeState()","            return codes.JS_SKIP_E","        }","        enter(el, changeState)","        return codes.JS_E","    } else { // leave","        if (typeof leave !== 'function') {","            changeState()","            return codes.JS_SKIP_L","        }","        leave(el, changeState)","        return codes.JS_L","    }","","}","","/**"," *  Sniff proper transition end event name"," */","function sniffTransitionEndEvent () {","    var el = document.createElement('vue'),","        defaultEvent = 'transitionend',","        events = {","            'transition'       : defaultEvent,","            'MozTransition'    : defaultEvent,","            'WebkitTransition' : 'webkitTransitionEnd'","        }","    for (var name in events) {","        if (el.style[name] !== undefined) {","            return events[name]","        }","    }","}","});","require.register(\"vue/src/directives/index.js\", function(exports, require, module){","var utils      = require('../utils'),","    transition = require('../transition')","","module.exports = {","","    on     : require('./on'),","    repeat : require('./repeat'),","    model  : require('./model'),","    'if'   : require('./if'),","","    attr: function (value) {","        this.el.setAttribute(this.arg, value)","    },","","    text: function (value) {","        this.el.textContent = utils.toText(value)","    },","","    html: function (value) {","        this.el.innerHTML = utils.toText(value)","    },","","    visible: function (value) {","        this.el.style.visibility = value ? '' : 'hidden'","    },","","    show: function (value) {","        var el = this.el,","            target = value ? '' : 'none',","            change = function () {","                el.style.display = target","            }","        transition(el, value ? 1 : -1, change, this.compiler)","    },","","    'class': function (value) {","        if (this.arg) {","            this.el.classList[value ? 'add' : 'remove'](this.arg)","        } else {","            if (this.lastVal) {","                this.el.classList.remove(this.lastVal)","            }","            if (value) {","                this.el.classList.add(value)","                this.lastVal = value","            }","        }","    },","","    style: {","        bind: function () {","            this.arg = convertCSSProperty(this.arg)","        },","        update: function (value) {","            this.el.style[this.arg] = value","        }","    }","}","","/**"," *  convert hyphen style CSS property to Camel style"," */","var CONVERT_RE = /-(.)/g","function convertCSSProperty (prop) {","    if (prop.charAt(0) === '-') prop = prop.slice(1)","    return prop.replace(CONVERT_RE, function (m, char) {","        return char.toUpperCase()","    })","}","});","require.register(\"vue/src/directives/if.js\", function(exports, require, module){","var config = require('../config'),","    transition = require('../transition')","","module.exports = {","","    bind: function () {","        this.parent = this.el.parentNode","        this.ref = document.createComment(config.prefix + '-if-' + this.key)","        this.el.vue_ref = this.ref","    },","","    update: function (value) {","","        var el       = this.el","","        if (!this.parent) { // the node was detached when bound","            if (!el.parentNode) {","                return","            } else {","                this.parent = el.parentNode","            }","        }","","        // should always have this.parent if we reach here","        var parent   = this.parent,","            ref      = this.ref,","            compiler = this.compiler","","        if (!value) {","            transition(el, -1, remove, compiler)","        } else {","            transition(el, 1, insert, compiler)","        }","","        function remove () {","            if (!el.parentNode) return","            // insert the reference node","            var next = el.nextSibling","            if (next) {","                parent.insertBefore(ref, next)","            } else {","                parent.appendChild(ref)","            }","            parent.removeChild(el)","        }","","        function insert () {","            if (el.parentNode) return","            parent.insertBefore(el, ref)","            parent.removeChild(ref)","        }","    },","","    unbind: function () {","        this.el.vue_ref = null","    }","}","});","require.register(\"vue/src/directives/repeat.js\", function(exports, require, module){","var Observer   = require('../observer'),","    Emitter    = require('../emitter'),","    utils      = require('../utils'),","    config     = require('../config'),","    transition = require('../transition'),","    ViewModel // lazy def to avoid circular dependency","","/**"," *  Mathods that perform precise DOM manipulation"," *  based on mutator method triggered"," */","var mutationHandlers = {","","    push: function (m) {","        var i, l = m.args.length,","            base = this.collection.length - l","        for (i = 0; i < l; i++) {","            this.buildItem(m.args[i], base + i)","        }","    },","","    pop: function () {","        var vm = this.vms.pop()","        if (vm) vm.$destroy()","    },","","    unshift: function (m) {","        var i, l = m.args.length","        for (i = 0; i < l; i++) {","            this.buildItem(m.args[i], i)","        }","    },","","    shift: function () {","        var vm = this.vms.shift()","        if (vm) vm.$destroy()","    },","","    splice: function (m) {","        var i, l,","            index = m.args[0],","            removed = m.args[1],","            added = m.args.length - 2,","            removedVMs = this.vms.splice(index, removed)","        for (i = 0, l = removedVMs.length; i < l; i++) {","            removedVMs[i].$destroy()","        }","        for (i = 0; i < added; i++) {","            this.buildItem(m.args[i + 2], index + i)","        }","    },","","    sort: function () {","        var key = this.arg,","            vms = this.vms,","            col = this.collection,","            l = col.length,","            sorted = new Array(l),","            i, j, vm, data","        for (i = 0; i < l; i++) {","            data = col[i]","            for (j = 0; j < l; j++) {","                vm = vms[j]","                if (vm[key] === data) {","                    sorted[i] = vm","                    break","                }","            }","        }","        for (i = 0; i < l; i++) {","            this.container.insertBefore(sorted[i].$el, this.ref)","        }","        this.vms = sorted","    },","","    reverse: function () {","        var vms = this.vms","        vms.reverse()","        for (var i = 0, l = vms.length; i < l; i++) {","            this.container.insertBefore(vms[i].$el, this.ref)","        }","    }","}","","module.exports = {","","    bind: function () {","","        var self = this,","            el   = self.el,","            ctn  = self.container = el.parentNode","","        // extract child VM information, if any","        ViewModel       = ViewModel || require('../viewmodel')","        var componentId = utils.attr(el, 'component')","        self.ChildVM    = self.compiler.getOption('components', componentId) || ViewModel","","        // extract transition information","        self.hasTrans   = el.hasAttribute(config.attrs.transition)","","        // create a comment node as a reference node for DOM insertions","        self.ref = document.createComment(config.prefix + '-repeat-' + self.arg)","        ctn.insertBefore(self.ref, el)","        ctn.removeChild(el)","","        self.initiated = false","        self.collection = null","        self.vms = null","        self.mutationListener = function (path, arr, mutation) {","            self.detach()","            var method = mutation.method","            mutationHandlers[method].call(self, mutation)","            if (method !== 'push' && method !== 'pop') {","                self.updateIndexes()","            }","            self.retach()","        }","","    },","","    update: function (collection) {","","        this.unbind(true)","        // attach an object to container to hold handlers","        this.container.vue_dHandlers = utils.hash()","        // if initiating with an empty collection, we need to","        // force a compile so that we get all the bindings for","        // dependency extraction.","        if (!this.initiated && (!collection || !collection.length)) {","            this.buildItem()","            this.initiated = true","        }","        collection = this.collection = collection || []","        this.vms = []","","        // listen for collection mutation events","        // the collection has been augmented during Binding.set()","        if (!collection.__observer__) Observer.watchArray(collection, null, new Emitter())","        collection.__observer__.on('mutate', this.mutationListener)","","        // create child-vms and append to DOM","        if (collection.length) {","            this.detach()","            for (var i = 0, l = collection.length; i < l; i++) {","                this.buildItem(collection[i], i)","            }","            this.retach()","        }","    },","","    /**","     *  Create a new child VM from a data object","     *  passing along compiler options indicating this","     *  is a v-repeat item.","     */","    buildItem: function (data, index) {","","        var node    = this.el.cloneNode(true),","            ctn     = this.container,","            scope   = {},","            ref, item","","        // append node into DOM first","        // so v-if can get access to parentNode","        if (data) {","            ref = this.vms.length > index","                ? this.vms[index].$el","                : this.ref","            // make sure it works with v-if","            if (!ref.parentNode) ref = ref.vue_ref","            // process transition info before appending","            node.vue_trans = utils.attr(node, 'transition', true)","            transition(node, 1, function () {","                ctn.insertBefore(node, ref)","            }, this.compiler)","        }","","        // set data on scope and compile","        scope[this.arg] = data || {}","        item = new this.ChildVM({","            el: node,","            scope: scope,","            compilerOptions: {","                repeat: true,","                repeatIndex: index,","                repeatCollection: this.collection,","                repeatPrefix: this.arg,","                parentCompiler: this.compiler,","                delegator: ctn","            }","        })","","        if (!data) {","            // this is a forced compile for an empty collection.","            // let's remove it...","            item.$destroy()","        } else {","            this.vms.splice(index, 0, item)","        }","    },","","    /**","     *  Update index of each item after a mutation","     */","    updateIndexes: function () {","        var i = this.vms.length","        while (i--) {","            this.vms[i].$index = i","        }","    },","","    /**","     *  Detach/retach the container from the DOM before mutation","     *  so that batch DOM updates are done in-memory and faster","     */","    detach: function () {","        if (this.hasTrans) return","        var c = this.container,","            p = this.parent = c.parentNode","        this.next = c.nextSibling","        if (p) p.removeChild(c)","    },","","    retach: function () {","        if (this.hasTrans) return","        var n = this.next,","            p = this.parent,","            c = this.container","        if (!p) return","        if (n) {","            p.insertBefore(c, n)","        } else {","            p.appendChild(c)","        }","    },","","    unbind: function () {","        if (this.collection) {","            this.collection.__observer__.off('mutate', this.mutationListener)","            var i = this.vms.length","            while (i--) {","                this.vms[i].$destroy()","            }","        }","        var ctn = this.container,","            handlers = ctn.vue_dHandlers","        for (var key in handlers) {","            ctn.removeEventListener(handlers[key].event, handlers[key])","        }","        ctn.vue_dHandlers = null","    }","}","});","require.register(\"vue/src/directives/on.js\", function(exports, require, module){","var utils = require('../utils')","","function delegateCheck (el, root, identifier) {","    while (el && el !== root) {","        if (el[identifier]) return el","        el = el.parentNode","    }","}","","module.exports = {","","    isFn: true,","","    bind: function () {","        if (this.compiler.repeat) {","            // attach an identifier to the el","            // so it can be matched during event delegation","            this.el[this.expression] = true","            // attach the owner viewmodel of this directive","            this.el.vue_viewmodel = this.vm","        }","    },","","    update: function (handler) {","        this.unbind(true)","        if (typeof handler !== 'function') {","            return utils.warn('Directive \"on\" expects a function value.')","        }","","        var compiler = this.compiler,","            event    = this.arg,","            ownerVM  = this.binding.compiler.vm","","        if (compiler.repeat &&","            // do not delegate if the repeat is combined with an extended VM","            !this.vm.constructor.super &&","            // blur and focus events do not bubble","            event !== 'blur' && event !== 'focus') {","","            // for each blocks, delegate for better performance","            // focus and blur events dont bubble so exclude them","            var delegator  = compiler.delegator,","                identifier = this.expression,","                dHandler   = delegator.vue_dHandlers[identifier]","","            if (dHandler) return","","            // the following only gets run once for the entire each block","            dHandler = delegator.vue_dHandlers[identifier] = function (e) {","                var target = delegateCheck(e.target, delegator, identifier)","                if (target) {","                    e.el = target","                    e.vm = target.vue_viewmodel","                    e.item = e.vm[compiler.repeatPrefix]","                    handler.call(ownerVM, e)","                }","            }","            dHandler.event = event","            delegator.addEventListener(event, dHandler)","","        } else {","","            // a normal, single element handler","            var vm = this.vm","            this.handler = function (e) {","                e.el = e.currentTarget","                e.vm = vm","                if (compiler.repeat) {","                    e.item = vm[compiler.repeatPrefix]","                }","                handler.call(ownerVM, e)","            }","            this.el.addEventListener(event, this.handler)","","        }","    },","","    unbind: function (update) {","        this.el.removeEventListener(this.arg, this.handler)","        this.handler = null","        if (!update) this.el.vue_viewmodel = null","    }","}","});","require.register(\"vue/src/directives/model.js\", function(exports, require, module){","var utils = require('../utils'),","    isIE9 = navigator.userAgent.indexOf('MSIE 9.0') > 0","","module.exports = {","","    bind: function () {","","        var self = this,","            el   = self.el,","            type = el.type","","        self.lock = false","","        // determine what event to listen to","        self.event =","            (self.compiler.options.lazy ||","            el.tagName === 'SELECT' ||","            type === 'checkbox' ||","            type === 'radio')","                ? 'change'","                : 'input'","","        // determin the attribute to change when updating","        var attr = type === 'checkbox'","            ? 'checked'","            : 'value'","","        // attach listener","        self.set = self.filters","            ? function () {","                // if this directive has filters","                // we need to let the vm.$set trigger","                // update() so filters are applied.","                // therefore we have to record cursor position","                // so that after vm.$set changes the input","                // value we can put the cursor back at where it is","                var cursorPos","                try {","                    cursorPos = el.selectionStart","                } catch (e) {}","                // `input` event has weird updating issue with","                // International (e.g. Chinese) input methods,","                // have to use a Timeout to hack around it...","                setTimeout(function () {","                    self.vm.$set(self.key, el[attr])","                    if (cursorPos !== undefined) {","                        el.setSelectionRange(cursorPos, cursorPos)","                    }","                }, 0)","            }","            : function () {","                // no filters, don't let it trigger update()","                self.lock = true","                self.vm.$set(self.key, el[attr])","                self.lock = false","            }","        el.addEventListener(self.event, self.set)","","        // fix shit for IE9","        // since it doesn't fire input on backspace / del / cut","        if (isIE9) {","            self.onCut = function () {","                // cut event fires before the value actually changes","                setTimeout(function () {","                    self.set()","                }, 0)","            }","            self.onDel = function (e) {","                if (e.keyCode === 46 || e.keyCode === 8) {","                    self.set()","                }","            }","            el.addEventListener('cut', self.onCut)","            el.addEventListener('keyup', self.onDel)","        }","    },","","    update: function (value) {","        if (this.lock) return","        /* jshint eqeqeq: false */","        var self = this,","            el   = self.el","        if (el.tagName === 'SELECT') { // select dropdown","            // setting <select>'s value in IE9 doesn't work","            var o = el.options,","                i = o.length,","                index = -1","            while (i--) {","                if (o[i].value == value) {","                    index = i","                    break","                }","            }","            o.selectedIndex = index","        } else if (el.type === 'radio') { // radio button","            el.checked = value == el.value","        } else if (el.type === 'checkbox') { // checkbox","            el.checked = !!value","        } else {","            el.value = utils.toText(value)","        }","    },","","    unbind: function () {","        this.el.removeEventListener(this.event, this.set)","        if (isIE9) {","            this.el.removeEventListener('cut', this.onCut)","            this.el.removeEventListener('keyup', this.onDel)","        }","    }","}","});","require.alias(\"component-emitter/index.js\", \"vue/deps/emitter/index.js\");","require.alias(\"component-emitter/index.js\", \"emitter/index.js\");","require.alias(\"component-indexof/index.js\", \"component-emitter/deps/indexof/index.js\");","","require.alias(\"vue/src/main.js\", \"vue/index.js\");"];
function require(path, parent, orig) {
    _$jscoverage_done("./test/vue.test.js", 11);
    var resolved = require.resolve(path);
    _$jscoverage_done("./test/vue.test.js", 14);
    if (_$jscoverage_done("./test/vue.test.js", 14, null == resolved)) {
        _$jscoverage_done("./test/vue.test.js", 15);
        orig = orig || path;
        _$jscoverage_done("./test/vue.test.js", 16);
        parent = parent || "root";
        _$jscoverage_done("./test/vue.test.js", 17);
        var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
        _$jscoverage_done("./test/vue.test.js", 18);
        err.path = orig;
        _$jscoverage_done("./test/vue.test.js", 19);
        err.parent = parent;
        _$jscoverage_done("./test/vue.test.js", 20);
        err.require = true;
        _$jscoverage_done("./test/vue.test.js", 21);
        throw err;
    }
    _$jscoverage_done("./test/vue.test.js", 24);
    var module = require.modules[resolved];
    _$jscoverage_done("./test/vue.test.js", 29);
    if (_$jscoverage_done("./test/vue.test.js", 29, !module._resolving) && _$jscoverage_done("./test/vue.test.js", 29, !module.exports)) {
        _$jscoverage_done("./test/vue.test.js", 30);
        var mod = {};
        _$jscoverage_done("./test/vue.test.js", 31);
        mod.exports = {};
        _$jscoverage_done("./test/vue.test.js", 32);
        mod.client = mod.component = true;
        _$jscoverage_done("./test/vue.test.js", 33);
        module._resolving = true;
        _$jscoverage_done("./test/vue.test.js", 34);
        module.call(this, mod.exports, require.relative(resolved), mod);
        _$jscoverage_done("./test/vue.test.js", 35);
        delete module._resolving;
        _$jscoverage_done("./test/vue.test.js", 36);
        module.exports = mod.exports;
    }
    _$jscoverage_done("./test/vue.test.js", 39);
    return module.exports;
}

_$jscoverage_done("./test/vue.test.js", 46);
require.modules = {};

_$jscoverage_done("./test/vue.test.js", 52);
require.aliases = {};

_$jscoverage_done("./test/vue.test.js", 68);
require.resolve = function(path) {
    _$jscoverage_done("./test/vue.test.js", 69);
    if (_$jscoverage_done("./test/vue.test.js", 69, path.charAt(0) === "/")) {
        _$jscoverage_done("./test/vue.test.js", 69);
        path = path.slice(1);
    }
    _$jscoverage_done("./test/vue.test.js", 71);
    var paths = [ path, path + ".js", path + ".json", path + "/index.js", path + "/index.json" ];
    _$jscoverage_done("./test/vue.test.js", 79);
    for (var i = 0; i < paths.length; i++) {
        _$jscoverage_done("./test/vue.test.js", 80);
        var path = paths[i];
        _$jscoverage_done("./test/vue.test.js", 81);
        if (_$jscoverage_done("./test/vue.test.js", 81, require.modules.hasOwnProperty(path))) {
            _$jscoverage_done("./test/vue.test.js", 81);
            return path;
        }
        _$jscoverage_done("./test/vue.test.js", 82);
        if (_$jscoverage_done("./test/vue.test.js", 82, require.aliases.hasOwnProperty(path))) {
            _$jscoverage_done("./test/vue.test.js", 82);
            return require.aliases[path];
        }
    }
};

_$jscoverage_done("./test/vue.test.js", 95);
require.normalize = function(curr, path) {
    _$jscoverage_done("./test/vue.test.js", 96);
    var segs = [];
    _$jscoverage_done("./test/vue.test.js", 98);
    if (_$jscoverage_done("./test/vue.test.js", 98, "." != path.charAt(0))) {
        _$jscoverage_done("./test/vue.test.js", 98);
        return path;
    }
    _$jscoverage_done("./test/vue.test.js", 100);
    curr = curr.split("/");
    _$jscoverage_done("./test/vue.test.js", 101);
    path = path.split("/");
    _$jscoverage_done("./test/vue.test.js", 103);
    for (var i = 0; i < path.length; ++i) {
        _$jscoverage_done("./test/vue.test.js", 104);
        if (_$jscoverage_done("./test/vue.test.js", 104, ".." == path[i])) {
            _$jscoverage_done("./test/vue.test.js", 105);
            curr.pop();
        } else {
            _$jscoverage_done("./test/vue.test.js", 106);
            if (_$jscoverage_done("./test/vue.test.js", 106, "." != path[i]) && _$jscoverage_done("./test/vue.test.js", 106, "" != path[i])) {
                _$jscoverage_done("./test/vue.test.js", 107);
                segs.push(path[i]);
            }
        }
    }
    _$jscoverage_done("./test/vue.test.js", 111);
    return curr.concat(segs).join("/");
};

_$jscoverage_done("./test/vue.test.js", 122);
require.register = function(path, definition) {
    _$jscoverage_done("./test/vue.test.js", 123);
    require.modules[path] = definition;
};

_$jscoverage_done("./test/vue.test.js", 134);
require.alias = function(from, to) {
    _$jscoverage_done("./test/vue.test.js", 135);
    if (_$jscoverage_done("./test/vue.test.js", 135, !require.modules.hasOwnProperty(from))) {
        _$jscoverage_done("./test/vue.test.js", 136);
        throw new Error('Failed to alias "' + from + '", it does not exist');
    }
    _$jscoverage_done("./test/vue.test.js", 138);
    require.aliases[to] = from;
};

_$jscoverage_done("./test/vue.test.js", 149);
require.relative = function(parent) {
    _$jscoverage_done("./test/vue.test.js", 150);
    var p = require.normalize(parent, "..");
    function lastIndexOf(arr, obj) {
        _$jscoverage_done("./test/vue.test.js", 157);
        var i = arr.length;
        _$jscoverage_done("./test/vue.test.js", 158);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 159);
            if (_$jscoverage_done("./test/vue.test.js", 159, arr[i] === obj)) {
                _$jscoverage_done("./test/vue.test.js", 159);
                return i;
            }
        }
        _$jscoverage_done("./test/vue.test.js", 161);
        return -1;
    }
    function localRequire(path) {
        _$jscoverage_done("./test/vue.test.js", 169);
        var resolved = localRequire.resolve(path);
        _$jscoverage_done("./test/vue.test.js", 170);
        return require(resolved, parent, path);
    }
    _$jscoverage_done("./test/vue.test.js", 177);
    localRequire.resolve = function(path) {
        _$jscoverage_done("./test/vue.test.js", 178);
        var c = path.charAt(0);
        _$jscoverage_done("./test/vue.test.js", 179);
        if (_$jscoverage_done("./test/vue.test.js", 179, "/" == c)) {
            _$jscoverage_done("./test/vue.test.js", 179);
            return path.slice(1);
        }
        _$jscoverage_done("./test/vue.test.js", 180);
        if (_$jscoverage_done("./test/vue.test.js", 180, "." == c)) {
            _$jscoverage_done("./test/vue.test.js", 180);
            return require.normalize(p, path);
        }
        _$jscoverage_done("./test/vue.test.js", 185);
        var segs = parent.split("/");
        _$jscoverage_done("./test/vue.test.js", 186);
        var i = lastIndexOf(segs, "deps") + 1;
        _$jscoverage_done("./test/vue.test.js", 187);
        if (_$jscoverage_done("./test/vue.test.js", 187, !i)) {
            _$jscoverage_done("./test/vue.test.js", 187);
            i = 0;
        }
        _$jscoverage_done("./test/vue.test.js", 188);
        path = segs.slice(0, i + 1).join("/") + "/deps/" + path;
        _$jscoverage_done("./test/vue.test.js", 189);
        return path;
    };
    _$jscoverage_done("./test/vue.test.js", 196);
    localRequire.exists = function(path) {
        _$jscoverage_done("./test/vue.test.js", 197);
        return require.modules.hasOwnProperty(localRequire.resolve(path));
    };
    _$jscoverage_done("./test/vue.test.js", 200);
    return localRequire;
};

_$jscoverage_done("./test/vue.test.js", 202);
require.register("component-indexof/index.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 203);
    module.exports = function(arr, obj) {
        _$jscoverage_done("./test/vue.test.js", 204);
        if (_$jscoverage_done("./test/vue.test.js", 204, arr.indexOf)) {
            _$jscoverage_done("./test/vue.test.js", 204);
            return arr.indexOf(obj);
        }
        _$jscoverage_done("./test/vue.test.js", 205);
        for (var i = 0; i < arr.length; ++i) {
            _$jscoverage_done("./test/vue.test.js", 206);
            if (_$jscoverage_done("./test/vue.test.js", 206, arr[i] === obj)) {
                _$jscoverage_done("./test/vue.test.js", 206);
                return i;
            }
        }
        _$jscoverage_done("./test/vue.test.js", 208);
        return -1;
    };
});

_$jscoverage_done("./test/vue.test.js", 211);
require.register("component-emitter/index.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 217);
    var index = require("indexof");
    _$jscoverage_done("./test/vue.test.js", 223);
    module.exports = Emitter;
    function Emitter(obj) {
        _$jscoverage_done("./test/vue.test.js", 232);
        if (_$jscoverage_done("./test/vue.test.js", 232, obj)) {
            _$jscoverage_done("./test/vue.test.js", 232);
            return mixin(obj);
        }
    }
    function mixin(obj) {
        _$jscoverage_done("./test/vue.test.js", 244);
        for (var key in Emitter.prototype) {
            _$jscoverage_done("./test/vue.test.js", 245);
            obj[key] = Emitter.prototype[key];
        }
        _$jscoverage_done("./test/vue.test.js", 247);
        return obj;
    }
    _$jscoverage_done("./test/vue.test.js", 259);
    Emitter.prototype.on = function(event, fn) {
        _$jscoverage_done("./test/vue.test.js", 260);
        this._callbacks = this._callbacks || {};
        _$jscoverage_done("./test/vue.test.js", 261);
        (this._callbacks[event] = this._callbacks[event] || []).push(fn);
        _$jscoverage_done("./test/vue.test.js", 263);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 276);
    Emitter.prototype.once = function(event, fn) {
        _$jscoverage_done("./test/vue.test.js", 277);
        var self = this;
        _$jscoverage_done("./test/vue.test.js", 278);
        this._callbacks = this._callbacks || {};
        function on() {
            _$jscoverage_done("./test/vue.test.js", 281);
            self.off(event, on);
            _$jscoverage_done("./test/vue.test.js", 282);
            fn.apply(this, arguments);
        }
        _$jscoverage_done("./test/vue.test.js", 285);
        fn._off = on;
        _$jscoverage_done("./test/vue.test.js", 286);
        this.on(event, on);
        _$jscoverage_done("./test/vue.test.js", 287);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 300);
    Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = function(event, fn) {
        _$jscoverage_done("./test/vue.test.js", 303);
        this._callbacks = this._callbacks || {};
        _$jscoverage_done("./test/vue.test.js", 306);
        if (_$jscoverage_done("./test/vue.test.js", 306, 0 == arguments.length)) {
            _$jscoverage_done("./test/vue.test.js", 307);
            this._callbacks = {};
            _$jscoverage_done("./test/vue.test.js", 308);
            return this;
        }
        _$jscoverage_done("./test/vue.test.js", 312);
        var callbacks = this._callbacks[event];
        _$jscoverage_done("./test/vue.test.js", 313);
        if (_$jscoverage_done("./test/vue.test.js", 313, !callbacks)) {
            _$jscoverage_done("./test/vue.test.js", 313);
            return this;
        }
        _$jscoverage_done("./test/vue.test.js", 316);
        if (_$jscoverage_done("./test/vue.test.js", 316, 1 == arguments.length)) {
            _$jscoverage_done("./test/vue.test.js", 317);
            delete this._callbacks[event];
            _$jscoverage_done("./test/vue.test.js", 318);
            return this;
        }
        _$jscoverage_done("./test/vue.test.js", 322);
        var i = index(callbacks, fn._off || fn);
        _$jscoverage_done("./test/vue.test.js", 323);
        if (_$jscoverage_done("./test/vue.test.js", 323, ~i)) {
            _$jscoverage_done("./test/vue.test.js", 323);
            callbacks.splice(i, 1);
        }
        _$jscoverage_done("./test/vue.test.js", 324);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 335);
    Emitter.prototype.emit = function(event) {
        _$jscoverage_done("./test/vue.test.js", 336);
        this._callbacks = this._callbacks || {};
        _$jscoverage_done("./test/vue.test.js", 337);
        var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event];
        _$jscoverage_done("./test/vue.test.js", 340);
        if (_$jscoverage_done("./test/vue.test.js", 340, callbacks)) {
            _$jscoverage_done("./test/vue.test.js", 341);
            callbacks = callbacks.slice(0);
            _$jscoverage_done("./test/vue.test.js", 342);
            for (var i = 0, len = callbacks.length; i < len; ++i) {
                _$jscoverage_done("./test/vue.test.js", 343);
                callbacks[i].apply(this, args);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 347);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 358);
    Emitter.prototype.listeners = function(event) {
        _$jscoverage_done("./test/vue.test.js", 359);
        this._callbacks = this._callbacks || {};
        _$jscoverage_done("./test/vue.test.js", 360);
        return this._callbacks[event] || [];
    };
    _$jscoverage_done("./test/vue.test.js", 371);
    Emitter.prototype.hasListeners = function(event) {
        _$jscoverage_done("./test/vue.test.js", 372);
        return !!this.listeners(event).length;
    };
});

_$jscoverage_done("./test/vue.test.js", 376);
require.register("vue/src/main.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 377);
    var config = require("./config"), ViewModel = require("./viewmodel"), directives = require("./directives"), filters = require("./filters"), utils = require("./utils");
    _$jscoverage_done("./test/vue.test.js", 386);
    ViewModel.config = function(opts) {
        _$jscoverage_done("./test/vue.test.js", 387);
        if (_$jscoverage_done("./test/vue.test.js", 387, opts)) {
            _$jscoverage_done("./test/vue.test.js", 388);
            utils.extend(config, opts);
            _$jscoverage_done("./test/vue.test.js", 389);
            if (_$jscoverage_done("./test/vue.test.js", 389, opts.prefix)) {
                _$jscoverage_done("./test/vue.test.js", 389);
                updatePrefix();
            }
        }
        _$jscoverage_done("./test/vue.test.js", 391);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 397);
    ViewModel.directive = function(id, fn) {
        _$jscoverage_done("./test/vue.test.js", 398);
        if (_$jscoverage_done("./test/vue.test.js", 398, !fn)) {
            _$jscoverage_done("./test/vue.test.js", 398);
            return directives[id];
        }
        _$jscoverage_done("./test/vue.test.js", 399);
        directives[id] = fn;
        _$jscoverage_done("./test/vue.test.js", 400);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 406);
    ViewModel.filter = function(id, fn) {
        _$jscoverage_done("./test/vue.test.js", 407);
        if (_$jscoverage_done("./test/vue.test.js", 407, !fn)) {
            _$jscoverage_done("./test/vue.test.js", 407);
            return filters[id];
        }
        _$jscoverage_done("./test/vue.test.js", 408);
        filters[id] = fn;
        _$jscoverage_done("./test/vue.test.js", 409);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 415);
    ViewModel.component = function(id, Ctor) {
        _$jscoverage_done("./test/vue.test.js", 416);
        if (_$jscoverage_done("./test/vue.test.js", 416, !Ctor)) {
            _$jscoverage_done("./test/vue.test.js", 416);
            return utils.components[id];
        }
        _$jscoverage_done("./test/vue.test.js", 417);
        utils.components[id] = utils.toConstructor(Ctor);
        _$jscoverage_done("./test/vue.test.js", 418);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 424);
    ViewModel.element = function(id, Ctor) {
        _$jscoverage_done("./test/vue.test.js", 425);
        if (_$jscoverage_done("./test/vue.test.js", 425, !Ctor)) {
            _$jscoverage_done("./test/vue.test.js", 425);
            return utils.elements[id];
        }
        _$jscoverage_done("./test/vue.test.js", 426);
        utils.elements[id] = utils.toConstructor(Ctor);
        _$jscoverage_done("./test/vue.test.js", 427);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 433);
    ViewModel.partial = function(id, partial) {
        _$jscoverage_done("./test/vue.test.js", 434);
        if (_$jscoverage_done("./test/vue.test.js", 434, !partial)) {
            _$jscoverage_done("./test/vue.test.js", 434);
            return utils.partials[id];
        }
        _$jscoverage_done("./test/vue.test.js", 435);
        utils.partials[id] = utils.toFragment(partial);
        _$jscoverage_done("./test/vue.test.js", 436);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 442);
    ViewModel.transition = function(id, transition) {
        _$jscoverage_done("./test/vue.test.js", 443);
        if (_$jscoverage_done("./test/vue.test.js", 443, !transition)) {
            _$jscoverage_done("./test/vue.test.js", 443);
            return utils.transitions[id];
        }
        _$jscoverage_done("./test/vue.test.js", 444);
        utils.transitions[id] = transition;
        _$jscoverage_done("./test/vue.test.js", 445);
        return this;
    };
    _$jscoverage_done("./test/vue.test.js", 448);
    ViewModel.extend = extend;
    function extend(options) {
        _$jscoverage_done("./test/vue.test.js", 456);
        var ParentVM = this;
        _$jscoverage_done("./test/vue.test.js", 459);
        options = inheritOptions(options, ParentVM.options, true);
        _$jscoverage_done("./test/vue.test.js", 460);
        utils.processOptions(options);
        _$jscoverage_done("./test/vue.test.js", 462);
        var ExtendedVM = function(opts) {
            _$jscoverage_done("./test/vue.test.js", 463);
            opts = inheritOptions(opts, options, true);
            _$jscoverage_done("./test/vue.test.js", 464);
            ParentVM.call(this, opts);
        };
        _$jscoverage_done("./test/vue.test.js", 468);
        var proto = ExtendedVM.prototype = Object.create(ParentVM.prototype);
        _$jscoverage_done("./test/vue.test.js", 469);
        utils.defProtected(proto, "constructor", ExtendedVM);
        _$jscoverage_done("./test/vue.test.js", 472);
        var protoMixins = options.proto;
        _$jscoverage_done("./test/vue.test.js", 473);
        if (_$jscoverage_done("./test/vue.test.js", 473, protoMixins)) {
            _$jscoverage_done("./test/vue.test.js", 474);
            for (var key in protoMixins) {
                _$jscoverage_done("./test/vue.test.js", 475);
                if (_$jscoverage_done("./test/vue.test.js", 475, !(key in ViewModel.prototype))) {
                    _$jscoverage_done("./test/vue.test.js", 476);
                    proto[key] = protoMixins[key];
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 482);
        ExtendedVM.extend = extend;
        _$jscoverage_done("./test/vue.test.js", 483);
        ExtendedVM.super = ParentVM;
        _$jscoverage_done("./test/vue.test.js", 484);
        ExtendedVM.options = options;
        _$jscoverage_done("./test/vue.test.js", 485);
        return ExtendedVM;
    }
    function inheritOptions(child, parent, topLevel) {
        _$jscoverage_done("./test/vue.test.js", 502);
        child = child || utils.hash();
        _$jscoverage_done("./test/vue.test.js", 503);
        if (_$jscoverage_done("./test/vue.test.js", 503, !parent)) {
            _$jscoverage_done("./test/vue.test.js", 503);
            return child;
        }
        _$jscoverage_done("./test/vue.test.js", 504);
        for (var key in parent) {
            _$jscoverage_done("./test/vue.test.js", 505);
            if (_$jscoverage_done("./test/vue.test.js", 505, key === "el") || _$jscoverage_done("./test/vue.test.js", 505, key === "proto")) {
                _$jscoverage_done("./test/vue.test.js", 505);
                continue;
            }
            _$jscoverage_done("./test/vue.test.js", 506);
            if (_$jscoverage_done("./test/vue.test.js", 506, !child[key])) {
                _$jscoverage_done("./test/vue.test.js", 507);
                child[key] = parent[key];
            } else {
                _$jscoverage_done("./test/vue.test.js", 508);
                if (_$jscoverage_done("./test/vue.test.js", 508, topLevel) && _$jscoverage_done("./test/vue.test.js", 508, utils.typeOf(child[key]) === "Object")) {
                    _$jscoverage_done("./test/vue.test.js", 509);
                    inheritOptions(child[key], parent[key], false);
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 512);
        return child;
    }
    _$jscoverage_done("./test/vue.test.js", 519);
    var specialAttributes = [ "id", "pre", "text", "repeat", "partial", "component", "transition" ];
    function updatePrefix() {
        _$jscoverage_done("./test/vue.test.js", 530);
        specialAttributes.forEach(setPrefix);
    }
    function setPrefix(attr) {
        _$jscoverage_done("./test/vue.test.js", 534);
        config.attrs[attr] = config.prefix + "-" + attr;
    }
    _$jscoverage_done("./test/vue.test.js", 537);
    updatePrefix();
    _$jscoverage_done("./test/vue.test.js", 538);
    module.exports = ViewModel;
});

_$jscoverage_done("./test/vue.test.js", 540);
require.register("vue/src/emitter.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 542);
    var Emitter, componentEmitter = "emitter";
    _$jscoverage_done("./test/vue.test.js", 545);
    try {
        _$jscoverage_done("./test/vue.test.js", 549);
        Emitter = require(componentEmitter);
    } catch (e) {}
    _$jscoverage_done("./test/vue.test.js", 552);
    module.exports = Emitter || require("events").EventEmitter;
});

_$jscoverage_done("./test/vue.test.js", 554);
require.register("vue/src/config.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 555);
    module.exports = {
        prefix: "v",
        debug: false,
        silent: false,
        enterClass: "v-enter",
        leaveClass: "v-leave",
        attrs: {}
    };
});

_$jscoverage_done("./test/vue.test.js", 566);
require.register("vue/src/utils.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 567);
    var config = require("./config"), attrs = config.attrs, toString = Object.prototype.toString, join = Array.prototype.join, console = window.console, ViewModel;
    function makeHash() {
        _$jscoverage_done("./test/vue.test.js", 579);
        return Object.create(null);
    }
    _$jscoverage_done("./test/vue.test.js", 582);
    var utils = module.exports = {
        hash: makeHash,
        components: makeHash(),
        partials: makeHash(),
        transitions: makeHash(),
        elements: makeHash(),
        attr: function(el, type, noRemove) {
            _$jscoverage_done("./test/vue.test.js", 597);
            var attr = attrs[type], val = el.getAttribute(attr);
            _$jscoverage_done("./test/vue.test.js", 599);
            if (_$jscoverage_done("./test/vue.test.js", 599, !noRemove) && _$jscoverage_done("./test/vue.test.js", 599, val !== null)) {
                _$jscoverage_done("./test/vue.test.js", 599);
                el.removeAttribute(attr);
            }
            _$jscoverage_done("./test/vue.test.js", 600);
            return val;
        },
        defProtected: function(obj, key, val, enumerable, configurable) {
            _$jscoverage_done("./test/vue.test.js", 609);
            if (_$jscoverage_done("./test/vue.test.js", 609, obj.hasOwnProperty(key))) {
                _$jscoverage_done("./test/vue.test.js", 609);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 610);
            Object.defineProperty(obj, key, {
                value: val,
                enumerable: !!enumerable,
                configurable: !!configurable
            });
        },
        typeOf: function(obj) {
            _$jscoverage_done("./test/vue.test.js", 622);
            return toString.call(obj).slice(8, -1);
        },
        bind: function(fn, ctx) {
            _$jscoverage_done("./test/vue.test.js", 630);
            return function(arg) {
                _$jscoverage_done("./test/vue.test.js", 631);
                return fn.call(ctx, arg);
            };
        },
        toText: function(value) {
            _$jscoverage_done("./test/vue.test.js", 641);
            return typeof value === "string" || typeof value === "boolean" || typeof value === "number" && value == value ? value : "";
        },
        extend: function(obj, ext, protective) {
            _$jscoverage_done("./test/vue.test.js", 652);
            for (var key in ext) {
                _$jscoverage_done("./test/vue.test.js", 653);
                if (_$jscoverage_done("./test/vue.test.js", 653, protective) && _$jscoverage_done("./test/vue.test.js", 653, obj[key])) {
                    _$jscoverage_done("./test/vue.test.js", 653);
                    continue;
                }
                _$jscoverage_done("./test/vue.test.js", 654);
                obj[key] = ext[key];
            }
        },
        unique: function(arr) {
            _$jscoverage_done("./test/vue.test.js", 662);
            var hash = utils.hash(), i = arr.length, key, res = [];
            _$jscoverage_done("./test/vue.test.js", 665);
            while (i--) {
                _$jscoverage_done("./test/vue.test.js", 666);
                key = arr[i];
                _$jscoverage_done("./test/vue.test.js", 667);
                if (_$jscoverage_done("./test/vue.test.js", 667, hash[key])) {
                    _$jscoverage_done("./test/vue.test.js", 667);
                    continue;
                }
                _$jscoverage_done("./test/vue.test.js", 668);
                hash[key] = 1;
                _$jscoverage_done("./test/vue.test.js", 669);
                res.push(key);
            }
            _$jscoverage_done("./test/vue.test.js", 671);
            return res;
        },
        toFragment: function(template) {
            _$jscoverage_done("./test/vue.test.js", 678);
            if (_$jscoverage_done("./test/vue.test.js", 678, typeof template !== "string")) {
                _$jscoverage_done("./test/vue.test.js", 679);
                return template;
            }
            _$jscoverage_done("./test/vue.test.js", 681);
            if (_$jscoverage_done("./test/vue.test.js", 681, template.charAt(0) === "#")) {
                _$jscoverage_done("./test/vue.test.js", 682);
                var templateNode = document.getElementById(template.slice(1));
                _$jscoverage_done("./test/vue.test.js", 683);
                if (_$jscoverage_done("./test/vue.test.js", 683, !templateNode)) {
                    _$jscoverage_done("./test/vue.test.js", 683);
                    return;
                }
                _$jscoverage_done("./test/vue.test.js", 684);
                template = templateNode.innerHTML;
            }
            _$jscoverage_done("./test/vue.test.js", 686);
            var node = document.createElement("div"), frag = document.createDocumentFragment(), child;
            _$jscoverage_done("./test/vue.test.js", 689);
            node.innerHTML = template.trim();
            _$jscoverage_done("./test/vue.test.js", 691);
            while (child = node.firstChild) {
                _$jscoverage_done("./test/vue.test.js", 692);
                frag.appendChild(child);
            }
            _$jscoverage_done("./test/vue.test.js", 694);
            return frag;
        },
        toConstructor: function(obj) {
            _$jscoverage_done("./test/vue.test.js", 702);
            ViewModel = ViewModel || require("./viewmodel");
            _$jscoverage_done("./test/vue.test.js", 703);
            return utils.typeOf(obj) === "Object" ? ViewModel.extend(obj) : typeof obj === "function" ? obj : null;
        },
        isConstructor: function(obj) {
            _$jscoverage_done("./test/vue.test.js", 711);
            ViewModel = ViewModel || require("./viewmodel");
            _$jscoverage_done("./test/vue.test.js", 712);
            return obj.prototype instanceof ViewModel || obj === ViewModel;
        },
        processOptions: function(options) {
            _$jscoverage_done("./test/vue.test.js", 719);
            var components = options.components, partials = options.partials, template = options.template, elements = options.elements, key;
            _$jscoverage_done("./test/vue.test.js", 724);
            if (_$jscoverage_done("./test/vue.test.js", 724, components)) {
                _$jscoverage_done("./test/vue.test.js", 725);
                for (key in components) {
                    _$jscoverage_done("./test/vue.test.js", 726);
                    components[key] = utils.toConstructor(components[key]);
                }
            }
            _$jscoverage_done("./test/vue.test.js", 729);
            if (_$jscoverage_done("./test/vue.test.js", 729, elements)) {
                _$jscoverage_done("./test/vue.test.js", 730);
                for (key in elements) {
                    _$jscoverage_done("./test/vue.test.js", 731);
                    elements[key] = utils.toConstructor(elements[key]);
                }
            }
            _$jscoverage_done("./test/vue.test.js", 734);
            if (_$jscoverage_done("./test/vue.test.js", 734, partials)) {
                _$jscoverage_done("./test/vue.test.js", 735);
                for (key in partials) {
                    _$jscoverage_done("./test/vue.test.js", 736);
                    partials[key] = utils.toFragment(partials[key]);
                }
            }
            _$jscoverage_done("./test/vue.test.js", 739);
            if (_$jscoverage_done("./test/vue.test.js", 739, template)) {
                _$jscoverage_done("./test/vue.test.js", 740);
                options.template = utils.toFragment(template);
            }
        },
        log: function() {
            _$jscoverage_done("./test/vue.test.js", 748);
            if (_$jscoverage_done("./test/vue.test.js", 748, config.debug) && _$jscoverage_done("./test/vue.test.js", 748, console)) {
                _$jscoverage_done("./test/vue.test.js", 749);
                console.log(join.call(arguments, " "));
            }
        },
        warn: function() {
            _$jscoverage_done("./test/vue.test.js", 757);
            if (_$jscoverage_done("./test/vue.test.js", 757, !config.silent) && _$jscoverage_done("./test/vue.test.js", 757, console)) {
                _$jscoverage_done("./test/vue.test.js", 758);
                console.trace();
                _$jscoverage_done("./test/vue.test.js", 759);
                console.warn(join.call(arguments, " "));
            }
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 764);
require.register("vue/src/compiler.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 765);
    var Emitter = require("./emitter"), Observer = require("./observer"), config = require("./config"), utils = require("./utils"), Binding = require("./binding"), Directive = require("./directive"), TextParser = require("./text-parser"), DepsParser = require("./deps-parser"), ExpParser = require("./exp-parser"), transition = require("./transition"), depsOb = DepsParser.observer, slice = Array.prototype.slice, log = utils.log, makeHash = utils.hash, def = utils.defProtected, hasOwn = Object.prototype.hasOwnProperty;
    function Compiler(vm, options) {
        _$jscoverage_done("./test/vue.test.js", 790);
        var compiler = this;
        _$jscoverage_done("./test/vue.test.js", 794);
        compiler.init = true;
        _$jscoverage_done("./test/vue.test.js", 797);
        options = compiler.options = options || makeHash();
        _$jscoverage_done("./test/vue.test.js", 798);
        utils.processOptions(options);
        _$jscoverage_done("./test/vue.test.js", 799);
        utils.extend(compiler, options.compilerOptions);
        _$jscoverage_done("./test/vue.test.js", 802);
        var el = compiler.setupElement(options);
        _$jscoverage_done("./test/vue.test.js", 803);
        log("\nnew VM instance:", el.tagName, "\n");
        _$jscoverage_done("./test/vue.test.js", 806);
        var scope = options.scope;
        _$jscoverage_done("./test/vue.test.js", 807);
        if (_$jscoverage_done("./test/vue.test.js", 807, scope)) {
            _$jscoverage_done("./test/vue.test.js", 807);
            utils.extend(vm, scope, true);
        }
        _$jscoverage_done("./test/vue.test.js", 809);
        compiler.vm = vm;
        _$jscoverage_done("./test/vue.test.js", 810);
        def(vm, "$", makeHash());
        _$jscoverage_done("./test/vue.test.js", 811);
        def(vm, "$el", el);
        _$jscoverage_done("./test/vue.test.js", 812);
        def(vm, "$compiler", compiler);
        _$jscoverage_done("./test/vue.test.js", 816);
        compiler.dirs = [];
        _$jscoverage_done("./test/vue.test.js", 817);
        compiler.exps = [];
        _$jscoverage_done("./test/vue.test.js", 818);
        compiler.childCompilers = [];
        _$jscoverage_done("./test/vue.test.js", 819);
        compiler.emitter = new Emitter;
        _$jscoverage_done("./test/vue.test.js", 824);
        var observables = compiler.observables = [], computed = compiler.computed = [];
        _$jscoverage_done("./test/vue.test.js", 828);
        var parent = compiler.parentCompiler;
        _$jscoverage_done("./test/vue.test.js", 829);
        compiler.bindings = parent ? Object.create(parent.bindings) : makeHash();
        _$jscoverage_done("./test/vue.test.js", 832);
        compiler.rootCompiler = parent ? getRoot(parent) : compiler;
        _$jscoverage_done("./test/vue.test.js", 838);
        var childId = utils.attr(el, "id");
        _$jscoverage_done("./test/vue.test.js", 839);
        if (_$jscoverage_done("./test/vue.test.js", 839, parent)) {
            _$jscoverage_done("./test/vue.test.js", 840);
            def(vm, "$parent", parent.vm);
            _$jscoverage_done("./test/vue.test.js", 841);
            if (_$jscoverage_done("./test/vue.test.js", 841, childId)) {
                _$jscoverage_done("./test/vue.test.js", 842);
                compiler.childId = childId;
                _$jscoverage_done("./test/vue.test.js", 843);
                parent.vm.$[childId] = vm;
            }
        }
        _$jscoverage_done("./test/vue.test.js", 848);
        compiler.setupObserver();
        _$jscoverage_done("./test/vue.test.js", 851);
        if (_$jscoverage_done("./test/vue.test.js", 851, options.init)) {
            _$jscoverage_done("./test/vue.test.js", 852);
            options.init.apply(vm, options.args || []);
        }
        _$jscoverage_done("./test/vue.test.js", 856);
        var key, keyPrefix;
        _$jscoverage_done("./test/vue.test.js", 857);
        for (key in vm) {
            _$jscoverage_done("./test/vue.test.js", 858);
            keyPrefix = key.charAt(0);
            _$jscoverage_done("./test/vue.test.js", 859);
            if (_$jscoverage_done("./test/vue.test.js", 859, keyPrefix !== "$") && _$jscoverage_done("./test/vue.test.js", 859, keyPrefix !== "_")) {
                _$jscoverage_done("./test/vue.test.js", 860);
                compiler.createBinding(key);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 866);
        if (_$jscoverage_done("./test/vue.test.js", 866, compiler.repeat)) {
            _$jscoverage_done("./test/vue.test.js", 867);
            vm.$index = compiler.repeatIndex;
            _$jscoverage_done("./test/vue.test.js", 868);
            def(vm, "$collection", compiler.repeatCollection);
            _$jscoverage_done("./test/vue.test.js", 869);
            compiler.createBinding("$index");
        }
        _$jscoverage_done("./test/vue.test.js", 874);
        compiler.compile(el, true);
        _$jscoverage_done("./test/vue.test.js", 879);
        var i = observables.length, binding;
        _$jscoverage_done("./test/vue.test.js", 880);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 881);
            binding = observables[i];
            _$jscoverage_done("./test/vue.test.js", 882);
            Observer.observe(binding.value, binding.key, compiler.observer);
        }
        _$jscoverage_done("./test/vue.test.js", 885);
        if (_$jscoverage_done("./test/vue.test.js", 885, computed.length)) {
            _$jscoverage_done("./test/vue.test.js", 885);
            DepsParser.parse(computed);
        }
        _$jscoverage_done("./test/vue.test.js", 888);
        compiler.init = false;
    }
    _$jscoverage_done("./test/vue.test.js", 891);
    var CompilerProto = Compiler.prototype;
    _$jscoverage_done("./test/vue.test.js", 897);
    CompilerProto.setupElement = function(options) {
        _$jscoverage_done("./test/vue.test.js", 899);
        var el = this.el = typeof options.el === "string" ? document.querySelector(options.el) : options.el || document.createElement(options.tagName || "div");
        _$jscoverage_done("./test/vue.test.js", 903);
        var template = options.template;
        _$jscoverage_done("./test/vue.test.js", 904);
        if (_$jscoverage_done("./test/vue.test.js", 904, template)) {
            _$jscoverage_done("./test/vue.test.js", 907);
            if (_$jscoverage_done("./test/vue.test.js", 907, options.replace) && _$jscoverage_done("./test/vue.test.js", 907, template.childNodes.length === 1)) {
                _$jscoverage_done("./test/vue.test.js", 908);
                var replacer = template.childNodes[0].cloneNode(true);
                _$jscoverage_done("./test/vue.test.js", 909);
                if (_$jscoverage_done("./test/vue.test.js", 909, el.parentNode)) {
                    _$jscoverage_done("./test/vue.test.js", 910);
                    el.parentNode.insertBefore(replacer, el);
                    _$jscoverage_done("./test/vue.test.js", 911);
                    el.parentNode.removeChild(el);
                }
                _$jscoverage_done("./test/vue.test.js", 913);
                el = replacer;
            } else {
                _$jscoverage_done("./test/vue.test.js", 915);
                el.innerHTML = "";
                _$jscoverage_done("./test/vue.test.js", 916);
                el.appendChild(template.cloneNode(true));
            }
        }
        _$jscoverage_done("./test/vue.test.js", 921);
        if (_$jscoverage_done("./test/vue.test.js", 921, options.id)) {
            _$jscoverage_done("./test/vue.test.js", 921);
            el.id = options.id;
        }
        _$jscoverage_done("./test/vue.test.js", 922);
        if (_$jscoverage_done("./test/vue.test.js", 922, options.className)) {
            _$jscoverage_done("./test/vue.test.js", 922);
            el.className = options.className;
        }
        _$jscoverage_done("./test/vue.test.js", 923);
        var attrs = options.attributes;
        _$jscoverage_done("./test/vue.test.js", 924);
        if (_$jscoverage_done("./test/vue.test.js", 924, attrs)) {
            _$jscoverage_done("./test/vue.test.js", 925);
            for (var attr in attrs) {
                _$jscoverage_done("./test/vue.test.js", 926);
                el.setAttribute(attr, attrs[attr]);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 930);
        return el;
    };
    _$jscoverage_done("./test/vue.test.js", 938);
    CompilerProto.setupObserver = function() {
        _$jscoverage_done("./test/vue.test.js", 940);
        var compiler = this, bindings = compiler.bindings, observer = compiler.observer = new Emitter;
        _$jscoverage_done("./test/vue.test.js", 946);
        observer.proxies = makeHash();
        _$jscoverage_done("./test/vue.test.js", 949);
        observer.on("get", function(key) {
            _$jscoverage_done("./test/vue.test.js", 951);
            check(key);
            _$jscoverage_done("./test/vue.test.js", 952);
            depsOb.emit("get", bindings[key]);
        }).on("set", function(key, val) {
            _$jscoverage_done("./test/vue.test.js", 955);
            observer.emit("change:" + key, val);
            _$jscoverage_done("./test/vue.test.js", 956);
            check(key);
            _$jscoverage_done("./test/vue.test.js", 957);
            bindings[key].update(val);
        }).on("mutate", function(key, val, mutation) {
            _$jscoverage_done("./test/vue.test.js", 960);
            observer.emit("change:" + key, val, mutation);
            _$jscoverage_done("./test/vue.test.js", 961);
            check(key);
            _$jscoverage_done("./test/vue.test.js", 962);
            bindings[key].pub();
        });
        function check(key) {
            _$jscoverage_done("./test/vue.test.js", 966);
            if (_$jscoverage_done("./test/vue.test.js", 966, !bindings[key])) {
                _$jscoverage_done("./test/vue.test.js", 967);
                compiler.createBinding(key);
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 975);
    CompilerProto.compile = function(node, root) {
        _$jscoverage_done("./test/vue.test.js", 977);
        var compiler = this;
        _$jscoverage_done("./test/vue.test.js", 979);
        if (_$jscoverage_done("./test/vue.test.js", 979, node.nodeType === 1)) {
            _$jscoverage_done("./test/vue.test.js", 982);
            if (_$jscoverage_done("./test/vue.test.js", 982, utils.attr(node, "pre") !== null)) {
                _$jscoverage_done("./test/vue.test.js", 982);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 985);
            var repeatExp, componentId, partialId, customElementFn = compiler.getOption("elements", node.tagName.toLowerCase());
            _$jscoverage_done("./test/vue.test.js", 999);
            if (_$jscoverage_done("./test/vue.test.js", 999, repeatExp = utils.attr(node, "repeat"))) {
                _$jscoverage_done("./test/vue.test.js", 1002);
                var directive = Directive.parse(config.attrs.repeat, repeatExp, compiler, node);
                _$jscoverage_done("./test/vue.test.js", 1003);
                if (_$jscoverage_done("./test/vue.test.js", 1003, directive)) {
                    _$jscoverage_done("./test/vue.test.js", 1004);
                    compiler.bindDirective(directive);
                }
            } else {
                _$jscoverage_done("./test/vue.test.js", 1008);
                if (_$jscoverage_done("./test/vue.test.js", 1008, !root) && _$jscoverage_done("./test/vue.test.js", 1008, customElementFn)) {
                    _$jscoverage_done("./test/vue.test.js", 1010);
                    addChild(customElementFn);
                } else {
                    _$jscoverage_done("./test/vue.test.js", 1013);
                    if (_$jscoverage_done("./test/vue.test.js", 1013, !root) && _$jscoverage_done("./test/vue.test.js", 1013, componentId = utils.attr(node, "component"))) {
                        _$jscoverage_done("./test/vue.test.js", 1015);
                        var ChildVM = compiler.getOption("components", componentId);
                        _$jscoverage_done("./test/vue.test.js", 1016);
                        if (_$jscoverage_done("./test/vue.test.js", 1016, ChildVM)) {
                            _$jscoverage_done("./test/vue.test.js", 1016);
                            addChild(ChildVM);
                        }
                    } else {
                        _$jscoverage_done("./test/vue.test.js", 1021);
                        node.vue_trans = utils.attr(node, "transition");
                        _$jscoverage_done("./test/vue.test.js", 1024);
                        partialId = utils.attr(node, "partial");
                        _$jscoverage_done("./test/vue.test.js", 1025);
                        if (_$jscoverage_done("./test/vue.test.js", 1025, partialId)) {
                            _$jscoverage_done("./test/vue.test.js", 1026);
                            var partial = compiler.getOption("partials", partialId);
                            _$jscoverage_done("./test/vue.test.js", 1027);
                            if (_$jscoverage_done("./test/vue.test.js", 1027, partial)) {
                                _$jscoverage_done("./test/vue.test.js", 1028);
                                node.innerHTML = "";
                                _$jscoverage_done("./test/vue.test.js", 1029);
                                node.appendChild(partial.cloneNode(true));
                            }
                        }
                        _$jscoverage_done("./test/vue.test.js", 1034);
                        compiler.compileNode(node);
                    }
                }
            }
        } else {
            _$jscoverage_done("./test/vue.test.js", 1037);
            if (_$jscoverage_done("./test/vue.test.js", 1037, node.nodeType === 3)) {
                _$jscoverage_done("./test/vue.test.js", 1039);
                compiler.compileTextNode(node);
            }
        }
        function addChild(Ctor) {
            _$jscoverage_done("./test/vue.test.js", 1044);
            if (_$jscoverage_done("./test/vue.test.js", 1044, utils.isConstructor(Ctor))) {
                _$jscoverage_done("./test/vue.test.js", 1045);
                var child = new Ctor({
                    el: node,
                    child: true,
                    compilerOptions: {
                        parentCompiler: compiler
                    }
                });
                _$jscoverage_done("./test/vue.test.js", 1052);
                compiler.childCompilers.push(child.$compiler);
            } else {
                _$jscoverage_done("./test/vue.test.js", 1055);
                Ctor(node);
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1063);
    CompilerProto.compileNode = function(node) {
        _$jscoverage_done("./test/vue.test.js", 1064);
        var i, j, attrs = node.attributes;
        _$jscoverage_done("./test/vue.test.js", 1066);
        if (_$jscoverage_done("./test/vue.test.js", 1066, attrs) && _$jscoverage_done("./test/vue.test.js", 1066, attrs.length)) {
            _$jscoverage_done("./test/vue.test.js", 1067);
            var attr, valid, exps, exp;
            _$jscoverage_done("./test/vue.test.js", 1069);
            i = attrs.length;
            _$jscoverage_done("./test/vue.test.js", 1070);
            while (i--) {
                _$jscoverage_done("./test/vue.test.js", 1071);
                attr = attrs[i];
                _$jscoverage_done("./test/vue.test.js", 1072);
                valid = false;
                _$jscoverage_done("./test/vue.test.js", 1073);
                exps = Directive.split(attr.value);
                _$jscoverage_done("./test/vue.test.js", 1076);
                j = exps.length;
                _$jscoverage_done("./test/vue.test.js", 1077);
                while (j--) {
                    _$jscoverage_done("./test/vue.test.js", 1078);
                    exp = exps[j];
                    _$jscoverage_done("./test/vue.test.js", 1079);
                    var directive = Directive.parse(attr.name, exp, this, node);
                    _$jscoverage_done("./test/vue.test.js", 1080);
                    if (_$jscoverage_done("./test/vue.test.js", 1080, directive)) {
                        _$jscoverage_done("./test/vue.test.js", 1081);
                        valid = true;
                        _$jscoverage_done("./test/vue.test.js", 1082);
                        this.bindDirective(directive);
                    }
                }
                _$jscoverage_done("./test/vue.test.js", 1085);
                if (_$jscoverage_done("./test/vue.test.js", 1085, valid)) {
                    _$jscoverage_done("./test/vue.test.js", 1085);
                    node.removeAttribute(attr.name);
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1089);
        if (_$jscoverage_done("./test/vue.test.js", 1089, node.childNodes.length)) {
            _$jscoverage_done("./test/vue.test.js", 1090);
            var nodes = slice.call(node.childNodes);
            _$jscoverage_done("./test/vue.test.js", 1091);
            for (i = 0, j = nodes.length; i < j; i++) {
                _$jscoverage_done("./test/vue.test.js", 1092);
                this.compile(nodes[i]);
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1100);
    CompilerProto.compileTextNode = function(node) {
        _$jscoverage_done("./test/vue.test.js", 1101);
        var tokens = TextParser.parse(node.nodeValue);
        _$jscoverage_done("./test/vue.test.js", 1102);
        if (_$jscoverage_done("./test/vue.test.js", 1102, !tokens)) {
            _$jscoverage_done("./test/vue.test.js", 1102);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 1103);
        var dirname = config.attrs.text, el, token, directive;
        _$jscoverage_done("./test/vue.test.js", 1105);
        for (var i = 0, l = tokens.length; i < l; i++) {
            _$jscoverage_done("./test/vue.test.js", 1106);
            token = tokens[i];
            _$jscoverage_done("./test/vue.test.js", 1107);
            if (_$jscoverage_done("./test/vue.test.js", 1107, token.key)) {
                _$jscoverage_done("./test/vue.test.js", 1108);
                if (_$jscoverage_done("./test/vue.test.js", 1108, token.key.charAt(0) === ">")) {
                    _$jscoverage_done("./test/vue.test.js", 1109);
                    var partialId = token.key.slice(1).trim(), partial = this.getOption("partials", partialId);
                    _$jscoverage_done("./test/vue.test.js", 1111);
                    if (_$jscoverage_done("./test/vue.test.js", 1111, partial)) {
                        _$jscoverage_done("./test/vue.test.js", 1112);
                        el = partial.cloneNode(true);
                        _$jscoverage_done("./test/vue.test.js", 1113);
                        this.compileNode(el);
                    }
                } else {
                    _$jscoverage_done("./test/vue.test.js", 1116);
                    el = document.createTextNode("");
                    _$jscoverage_done("./test/vue.test.js", 1117);
                    directive = Directive.parse(dirname, token.key, this, el);
                    _$jscoverage_done("./test/vue.test.js", 1118);
                    if (_$jscoverage_done("./test/vue.test.js", 1118, directive)) {
                        _$jscoverage_done("./test/vue.test.js", 1119);
                        this.bindDirective(directive);
                    }
                }
            } else {
                _$jscoverage_done("./test/vue.test.js", 1123);
                el = document.createTextNode(token);
            }
            _$jscoverage_done("./test/vue.test.js", 1125);
            node.parentNode.insertBefore(el, node);
        }
        _$jscoverage_done("./test/vue.test.js", 1127);
        node.parentNode.removeChild(node);
    };
    _$jscoverage_done("./test/vue.test.js", 1133);
    CompilerProto.bindDirective = function(directive) {
        _$jscoverage_done("./test/vue.test.js", 1136);
        this.dirs.push(directive);
        _$jscoverage_done("./test/vue.test.js", 1140);
        if (_$jscoverage_done("./test/vue.test.js", 1140, directive.isSimple)) {
            _$jscoverage_done("./test/vue.test.js", 1141);
            if (_$jscoverage_done("./test/vue.test.js", 1141, directive.bind)) {
                _$jscoverage_done("./test/vue.test.js", 1141);
                directive.bind();
            }
            _$jscoverage_done("./test/vue.test.js", 1142);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 1146);
        var binding, compiler = this, key = directive.key, baseKey = key.split(".")[0], ownerCompiler = traceOwnerCompiler(directive, compiler);
        _$jscoverage_done("./test/vue.test.js", 1152);
        if (_$jscoverage_done("./test/vue.test.js", 1152, directive.isExp)) {
            _$jscoverage_done("./test/vue.test.js", 1154);
            binding = compiler.createBinding(key, true, directive.isFn);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1155);
            if (_$jscoverage_done("./test/vue.test.js", 1155, ownerCompiler.vm.hasOwnProperty(baseKey))) {
                _$jscoverage_done("./test/vue.test.js", 1159);
                binding = hasOwn.call(ownerCompiler.bindings, key) ? ownerCompiler.bindings[key] : ownerCompiler.createBinding(key);
            } else {
                _$jscoverage_done("./test/vue.test.js", 1166);
                binding = ownerCompiler.bindings[key] || compiler.rootCompiler.createBinding(key);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1169);
        binding.instances.push(directive);
        _$jscoverage_done("./test/vue.test.js", 1170);
        directive.binding = binding;
        _$jscoverage_done("./test/vue.test.js", 1172);
        var value = binding.value;
        _$jscoverage_done("./test/vue.test.js", 1174);
        if (_$jscoverage_done("./test/vue.test.js", 1174, directive.bind)) {
            _$jscoverage_done("./test/vue.test.js", 1175);
            directive.bind(value);
        }
        _$jscoverage_done("./test/vue.test.js", 1179);
        if (_$jscoverage_done("./test/vue.test.js", 1179, value !== undefined)) {
            _$jscoverage_done("./test/vue.test.js", 1180);
            if (_$jscoverage_done("./test/vue.test.js", 1180, binding.isComputed)) {
                _$jscoverage_done("./test/vue.test.js", 1181);
                directive.refresh(value);
            } else {
                _$jscoverage_done("./test/vue.test.js", 1183);
                directive.update(value, true);
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1191);
    CompilerProto.createBinding = function(key, isExp, isFn) {
        _$jscoverage_done("./test/vue.test.js", 1193);
        var compiler = this, bindings = compiler.bindings, binding = new Binding(compiler, key, isExp, isFn);
        _$jscoverage_done("./test/vue.test.js", 1197);
        if (_$jscoverage_done("./test/vue.test.js", 1197, isExp)) {
            _$jscoverage_done("./test/vue.test.js", 1200);
            var getter = ExpParser.parse(key, compiler);
            _$jscoverage_done("./test/vue.test.js", 1201);
            if (_$jscoverage_done("./test/vue.test.js", 1201, getter)) {
                _$jscoverage_done("./test/vue.test.js", 1202);
                log("  created expression binding: " + key);
                _$jscoverage_done("./test/vue.test.js", 1203);
                binding.value = isFn ? getter : {
                    $get: getter
                };
                _$jscoverage_done("./test/vue.test.js", 1206);
                compiler.markComputed(binding);
                _$jscoverage_done("./test/vue.test.js", 1207);
                compiler.exps.push(binding);
            }
        } else {
            _$jscoverage_done("./test/vue.test.js", 1210);
            log("  created binding: " + key);
            _$jscoverage_done("./test/vue.test.js", 1211);
            bindings[key] = binding;
            _$jscoverage_done("./test/vue.test.js", 1214);
            Observer.ensurePath(compiler.vm, key);
            _$jscoverage_done("./test/vue.test.js", 1215);
            if (_$jscoverage_done("./test/vue.test.js", 1215, binding.root)) {
                _$jscoverage_done("./test/vue.test.js", 1217);
                compiler.define(key, binding);
            } else {
                _$jscoverage_done("./test/vue.test.js", 1219);
                var parentKey = key.slice(0, key.lastIndexOf("."));
                _$jscoverage_done("./test/vue.test.js", 1220);
                if (_$jscoverage_done("./test/vue.test.js", 1220, !hasOwn.call(bindings, parentKey))) {
                    _$jscoverage_done("./test/vue.test.js", 1223);
                    compiler.createBinding(parentKey);
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1227);
        return binding;
    };
    _$jscoverage_done("./test/vue.test.js", 1234);
    CompilerProto.define = function(key, binding) {
        _$jscoverage_done("./test/vue.test.js", 1236);
        log("    defined root binding: " + key);
        _$jscoverage_done("./test/vue.test.js", 1238);
        var compiler = this, vm = compiler.vm, ob = compiler.observer, value = binding.value = vm[key], type = utils.typeOf(value);
        _$jscoverage_done("./test/vue.test.js", 1244);
        if (_$jscoverage_done("./test/vue.test.js", 1244, type === "Object") && _$jscoverage_done("./test/vue.test.js", 1244, value.$get)) {
            _$jscoverage_done("./test/vue.test.js", 1246);
            compiler.markComputed(binding);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1247);
            if (_$jscoverage_done("./test/vue.test.js", 1247, type === "Object") || _$jscoverage_done("./test/vue.test.js", 1247, type === "Array")) {
                _$jscoverage_done("./test/vue.test.js", 1251);
                compiler.observables.push(binding);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1254);
        Object.defineProperty(vm, key, {
            enumerable: true,
            get: function() {
                _$jscoverage_done("./test/vue.test.js", 1257);
                var value = binding.value;
                _$jscoverage_done("./test/vue.test.js", 1258);
                if (_$jscoverage_done("./test/vue.test.js", 1258, depsOb.active) && _$jscoverage_done("./test/vue.test.js", 1258, !binding.isComputed) && (_$jscoverage_done("./test/vue.test.js", 1258, !value) || _$jscoverage_done("./test/vue.test.js", 1258, !value.__observer__)) || _$jscoverage_done("./test/vue.test.js", 1258, Array.isArray(value))) {
                    _$jscoverage_done("./test/vue.test.js", 1262);
                    ob.emit("get", key);
                }
                _$jscoverage_done("./test/vue.test.js", 1264);
                return binding.isComputed ? value.$get() : value;
            },
            set: function(newVal) {
                _$jscoverage_done("./test/vue.test.js", 1269);
                var value = binding.value;
                _$jscoverage_done("./test/vue.test.js", 1270);
                if (_$jscoverage_done("./test/vue.test.js", 1270, binding.isComputed)) {
                    _$jscoverage_done("./test/vue.test.js", 1271);
                    if (_$jscoverage_done("./test/vue.test.js", 1271, value.$set)) {
                        _$jscoverage_done("./test/vue.test.js", 1272);
                        value.$set(newVal);
                    }
                } else {
                    _$jscoverage_done("./test/vue.test.js", 1274);
                    if (_$jscoverage_done("./test/vue.test.js", 1274, newVal !== value)) {
                        _$jscoverage_done("./test/vue.test.js", 1276);
                        Observer.unobserve(value, key, ob);
                        _$jscoverage_done("./test/vue.test.js", 1278);
                        binding.value = newVal;
                        _$jscoverage_done("./test/vue.test.js", 1279);
                        ob.emit("set", key, newVal);
                        _$jscoverage_done("./test/vue.test.js", 1280);
                        Observer.ensurePaths(key, newVal, compiler.bindings);
                        _$jscoverage_done("./test/vue.test.js", 1283);
                        Observer.observe(newVal, key, ob);
                    }
                }
            }
        });
    };
    _$jscoverage_done("./test/vue.test.js", 1292);
    CompilerProto.markComputed = function(binding) {
        _$jscoverage_done("./test/vue.test.js", 1293);
        var value = binding.value, vm = this.vm;
        _$jscoverage_done("./test/vue.test.js", 1295);
        binding.isComputed = true;
        _$jscoverage_done("./test/vue.test.js", 1297);
        if (_$jscoverage_done("./test/vue.test.js", 1297, binding.isFn)) {
            _$jscoverage_done("./test/vue.test.js", 1298);
            binding.value = utils.bind(value, vm);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1300);
            value.$get = utils.bind(value.$get, vm);
            _$jscoverage_done("./test/vue.test.js", 1301);
            if (_$jscoverage_done("./test/vue.test.js", 1301, value.$set)) {
                _$jscoverage_done("./test/vue.test.js", 1302);
                value.$set = utils.bind(value.$set, vm);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1306);
        this.computed.push(binding);
    };
    _$jscoverage_done("./test/vue.test.js", 1312);
    CompilerProto.getOption = function(type, id) {
        _$jscoverage_done("./test/vue.test.js", 1313);
        var opts = this.options;
        _$jscoverage_done("./test/vue.test.js", 1314);
        return opts[type] && opts[type][id] || utils[type] && utils[type][id];
    };
    _$jscoverage_done("./test/vue.test.js", 1320);
    CompilerProto.destroy = function() {
        _$jscoverage_done("./test/vue.test.js", 1322);
        var compiler = this, i, key, dir, instances, binding, el = compiler.el, directives = compiler.dirs, exps = compiler.exps, bindings = compiler.bindings, teardown = compiler.options.teardown;
        _$jscoverage_done("./test/vue.test.js", 1331);
        if (_$jscoverage_done("./test/vue.test.js", 1331, teardown)) {
            _$jscoverage_done("./test/vue.test.js", 1331);
            teardown();
        }
        _$jscoverage_done("./test/vue.test.js", 1334);
        compiler.observer.off();
        _$jscoverage_done("./test/vue.test.js", 1335);
        compiler.emitter.off();
        _$jscoverage_done("./test/vue.test.js", 1338);
        i = directives.length;
        _$jscoverage_done("./test/vue.test.js", 1339);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1340);
            dir = directives[i];
            _$jscoverage_done("./test/vue.test.js", 1344);
            if (_$jscoverage_done("./test/vue.test.js", 1344, !dir.isSimple) && _$jscoverage_done("./test/vue.test.js", 1344, dir.binding.compiler !== compiler)) {
                _$jscoverage_done("./test/vue.test.js", 1345);
                instances = dir.binding.instances;
                _$jscoverage_done("./test/vue.test.js", 1346);
                if (_$jscoverage_done("./test/vue.test.js", 1346, instances)) {
                    _$jscoverage_done("./test/vue.test.js", 1346);
                    instances.splice(instances.indexOf(dir), 1);
                }
            }
            _$jscoverage_done("./test/vue.test.js", 1348);
            dir.unbind();
        }
        _$jscoverage_done("./test/vue.test.js", 1352);
        i = exps.length;
        _$jscoverage_done("./test/vue.test.js", 1353);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1354);
            exps[i].unbind();
        }
        _$jscoverage_done("./test/vue.test.js", 1358);
        for (key in bindings) {
            _$jscoverage_done("./test/vue.test.js", 1359);
            if (_$jscoverage_done("./test/vue.test.js", 1359, hasOwn.call(bindings, key))) {
                _$jscoverage_done("./test/vue.test.js", 1360);
                binding = bindings[key];
                _$jscoverage_done("./test/vue.test.js", 1361);
                if (_$jscoverage_done("./test/vue.test.js", 1361, binding.root)) {
                    _$jscoverage_done("./test/vue.test.js", 1362);
                    Observer.unobserve(binding.value, binding.key, compiler.observer);
                }
                _$jscoverage_done("./test/vue.test.js", 1364);
                binding.unbind();
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1369);
        var parent = compiler.parentCompiler, childId = compiler.childId;
        _$jscoverage_done("./test/vue.test.js", 1371);
        if (_$jscoverage_done("./test/vue.test.js", 1371, parent)) {
            _$jscoverage_done("./test/vue.test.js", 1372);
            parent.childCompilers.splice(parent.childCompilers.indexOf(compiler), 1);
            _$jscoverage_done("./test/vue.test.js", 1373);
            if (_$jscoverage_done("./test/vue.test.js", 1373, childId)) {
                _$jscoverage_done("./test/vue.test.js", 1374);
                delete parent.vm.$[childId];
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1379);
        if (_$jscoverage_done("./test/vue.test.js", 1379, el === document.body)) {
            _$jscoverage_done("./test/vue.test.js", 1380);
            el.innerHTML = "";
        } else {
            _$jscoverage_done("./test/vue.test.js", 1381);
            if (_$jscoverage_done("./test/vue.test.js", 1381, el.parentNode)) {
                _$jscoverage_done("./test/vue.test.js", 1382);
                transition(el, -1, function() {
                    _$jscoverage_done("./test/vue.test.js", 1383);
                    el.parentNode.removeChild(el);
                }, this);
            }
        }
    };
    function traceOwnerCompiler(key, compiler) {
        _$jscoverage_done("./test/vue.test.js", 1394);
        if (_$jscoverage_done("./test/vue.test.js", 1394, key.nesting)) {
            _$jscoverage_done("./test/vue.test.js", 1395);
            var levels = key.nesting;
            _$jscoverage_done("./test/vue.test.js", 1396);
            while (compiler.parentCompiler && levels--) {
                _$jscoverage_done("./test/vue.test.js", 1397);
                compiler = compiler.parentCompiler;
            }
        } else {
            _$jscoverage_done("./test/vue.test.js", 1399);
            if (_$jscoverage_done("./test/vue.test.js", 1399, key.root)) {
                _$jscoverage_done("./test/vue.test.js", 1400);
                while (compiler.parentCompiler) {
                    _$jscoverage_done("./test/vue.test.js", 1401);
                    compiler = compiler.parentCompiler;
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1404);
        return compiler;
    }
    function getRoot(compiler) {
        _$jscoverage_done("./test/vue.test.js", 1411);
        return traceOwnerCompiler({
            root: true
        }, compiler);
    }
    _$jscoverage_done("./test/vue.test.js", 1414);
    module.exports = Compiler;
});

_$jscoverage_done("./test/vue.test.js", 1416);
require.register("vue/src/viewmodel.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 1417);
    var Compiler = require("./compiler"), def = require("./utils").defProtected;
    function ViewModel(options) {
        _$jscoverage_done("./test/vue.test.js", 1427);
        new Compiler(this, options);
    }
    _$jscoverage_done("./test/vue.test.js", 1432);
    var VMProto = ViewModel.prototype;
    _$jscoverage_done("./test/vue.test.js", 1438);
    def(VMProto, "$set", function(key, value) {
        _$jscoverage_done("./test/vue.test.js", 1439);
        var path = key.split("."), obj = getTargetVM(this, path);
        _$jscoverage_done("./test/vue.test.js", 1441);
        if (_$jscoverage_done("./test/vue.test.js", 1441, !obj)) {
            _$jscoverage_done("./test/vue.test.js", 1441);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 1442);
        for (var d = 0, l = path.length - 1; d < l; d++) {
            _$jscoverage_done("./test/vue.test.js", 1443);
            obj = obj[path[d]];
        }
        _$jscoverage_done("./test/vue.test.js", 1445);
        obj[path[d]] = value;
    });
    _$jscoverage_done("./test/vue.test.js", 1452);
    def(VMProto, "$watch", function(key, callback) {
        _$jscoverage_done("./test/vue.test.js", 1453);
        this.$compiler.observer.on("change:" + key, callback);
    });
    _$jscoverage_done("./test/vue.test.js", 1459);
    def(VMProto, "$unwatch", function(key, callback) {
        _$jscoverage_done("./test/vue.test.js", 1463);
        var args = [ "change:" + key ], ob = this.$compiler.observer;
        _$jscoverage_done("./test/vue.test.js", 1465);
        if (_$jscoverage_done("./test/vue.test.js", 1465, callback)) {
            _$jscoverage_done("./test/vue.test.js", 1465);
            args.push(callback);
        }
        _$jscoverage_done("./test/vue.test.js", 1466);
        ob.off.apply(ob, args);
    });
    _$jscoverage_done("./test/vue.test.js", 1472);
    def(VMProto, "$destroy", function() {
        _$jscoverage_done("./test/vue.test.js", 1473);
        this.$compiler.destroy();
    });
    _$jscoverage_done("./test/vue.test.js", 1479);
    def(VMProto, "$broadcast", function() {
        _$jscoverage_done("./test/vue.test.js", 1480);
        var children = this.$compiler.childCompilers, i = children.length, child;
        _$jscoverage_done("./test/vue.test.js", 1483);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1484);
            child = children[i];
            _$jscoverage_done("./test/vue.test.js", 1485);
            child.emitter.emit.apply(child.emitter, arguments);
            _$jscoverage_done("./test/vue.test.js", 1486);
            child.vm.$broadcast.apply(child.vm, arguments);
        }
    });
    _$jscoverage_done("./test/vue.test.js", 1493);
    def(VMProto, "$emit", function() {
        _$jscoverage_done("./test/vue.test.js", 1494);
        var compiler = this.$compiler, emitter = compiler.emitter, parent = compiler.parentCompiler;
        _$jscoverage_done("./test/vue.test.js", 1497);
        emitter.emit.apply(emitter, arguments);
        _$jscoverage_done("./test/vue.test.js", 1498);
        if (_$jscoverage_done("./test/vue.test.js", 1498, parent)) {
            _$jscoverage_done("./test/vue.test.js", 1499);
            parent.emitter.emit.apply(parent.emitter, arguments);
            _$jscoverage_done("./test/vue.test.js", 1500);
            parent.vm.$emit.apply(parent.vm, arguments);
        }
    });
    _$jscoverage_done("./test/vue.test.js", 1507);
    [ "on", "off", "once" ].forEach(function(method) {
        _$jscoverage_done("./test/vue.test.js", 1508);
        def(VMProto, "$" + method, function() {
            _$jscoverage_done("./test/vue.test.js", 1509);
            var emitter = this.$compiler.emitter;
            _$jscoverage_done("./test/vue.test.js", 1510);
            emitter[method].apply(emitter, arguments);
        });
    });
    function getTargetVM(vm, path) {
        _$jscoverage_done("./test/vue.test.js", 1519);
        var baseKey = path[0], binding = vm.$compiler.bindings[baseKey];
        _$jscoverage_done("./test/vue.test.js", 1521);
        return binding ? binding.compiler.vm : null;
    }
    _$jscoverage_done("./test/vue.test.js", 1526);
    module.exports = ViewModel;
});

_$jscoverage_done("./test/vue.test.js", 1528);
require.register("vue/src/binding.js", function(exports, require, module) {
    function Binding(compiler, key, isExp, isFn) {
        _$jscoverage_done("./test/vue.test.js", 1537);
        this.value = undefined;
        _$jscoverage_done("./test/vue.test.js", 1538);
        this.isExp = !!isExp;
        _$jscoverage_done("./test/vue.test.js", 1539);
        this.isFn = isFn;
        _$jscoverage_done("./test/vue.test.js", 1540);
        this.root = !this.isExp && key.indexOf(".") === -1;
        _$jscoverage_done("./test/vue.test.js", 1541);
        this.compiler = compiler;
        _$jscoverage_done("./test/vue.test.js", 1542);
        this.key = key;
        _$jscoverage_done("./test/vue.test.js", 1543);
        this.instances = [];
        _$jscoverage_done("./test/vue.test.js", 1544);
        this.subs = [];
        _$jscoverage_done("./test/vue.test.js", 1545);
        this.deps = [];
    }
    _$jscoverage_done("./test/vue.test.js", 1548);
    var BindingProto = Binding.prototype;
    _$jscoverage_done("./test/vue.test.js", 1553);
    BindingProto.update = function(value) {
        _$jscoverage_done("./test/vue.test.js", 1554);
        this.value = value;
        _$jscoverage_done("./test/vue.test.js", 1555);
        var i = this.instances.length;
        _$jscoverage_done("./test/vue.test.js", 1556);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1557);
            this.instances[i].update(value);
        }
        _$jscoverage_done("./test/vue.test.js", 1559);
        this.pub();
    };
    _$jscoverage_done("./test/vue.test.js", 1566);
    BindingProto.refresh = function() {
        _$jscoverage_done("./test/vue.test.js", 1567);
        var i = this.instances.length;
        _$jscoverage_done("./test/vue.test.js", 1568);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1569);
            this.instances[i].refresh();
        }
        _$jscoverage_done("./test/vue.test.js", 1571);
        this.pub();
    };
    _$jscoverage_done("./test/vue.test.js", 1578);
    BindingProto.pub = function() {
        _$jscoverage_done("./test/vue.test.js", 1579);
        var i = this.subs.length;
        _$jscoverage_done("./test/vue.test.js", 1580);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1581);
            this.subs[i].refresh();
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1588);
    BindingProto.unbind = function() {
        _$jscoverage_done("./test/vue.test.js", 1589);
        var i = this.instances.length;
        _$jscoverage_done("./test/vue.test.js", 1590);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1591);
            this.instances[i].unbind();
        }
        _$jscoverage_done("./test/vue.test.js", 1593);
        i = this.deps.length;
        _$jscoverage_done("./test/vue.test.js", 1594);
        var subs;
        _$jscoverage_done("./test/vue.test.js", 1595);
        while (i--) {
            _$jscoverage_done("./test/vue.test.js", 1596);
            subs = this.deps[i].subs;
            _$jscoverage_done("./test/vue.test.js", 1597);
            subs.splice(subs.indexOf(this), 1);
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1601);
    module.exports = Binding;
});

_$jscoverage_done("./test/vue.test.js", 1603);
require.register("vue/src/observer.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 1606);
    var Emitter = require("./emitter"), utils = require("./utils"), depsOb = require("./deps-parser").observer, typeOf = utils.typeOf, def = utils.defProtected, slice = Array.prototype.slice, methods = [ "push", "pop", "shift", "unshift", "splice", "sort", "reverse" ], hasProto = {}.__proto__;
    _$jscoverage_done("./test/vue.test.js", 1626);
    var ArrayProxy = Object.create(Array.prototype);
    _$jscoverage_done("./test/vue.test.js", 1629);
    methods.forEach(function(method) {
        _$jscoverage_done("./test/vue.test.js", 1630);
        def(ArrayProxy, method, function() {
            _$jscoverage_done("./test/vue.test.js", 1631);
            var result = Array.prototype[method].apply(this, arguments);
            _$jscoverage_done("./test/vue.test.js", 1632);
            this.__observer__.emit("mutate", this.__observer__.path, this, {
                method: method,
                args: slice.call(arguments),
                result: result
            });
            _$jscoverage_done("./test/vue.test.js", 1637);
            return result;
        }, !hasProto);
    });
    _$jscoverage_done("./test/vue.test.js", 1642);
    var extensions = {
        remove: function(index) {
            _$jscoverage_done("./test/vue.test.js", 1644);
            if (_$jscoverage_done("./test/vue.test.js", 1644, typeof index === "function")) {
                _$jscoverage_done("./test/vue.test.js", 1645);
                var i = this.length, removed = [];
                _$jscoverage_done("./test/vue.test.js", 1647);
                while (i--) {
                    _$jscoverage_done("./test/vue.test.js", 1648);
                    if (_$jscoverage_done("./test/vue.test.js", 1648, index(this[i]))) {
                        _$jscoverage_done("./test/vue.test.js", 1649);
                        removed.push(this.splice(i, 1)[0]);
                    }
                }
                _$jscoverage_done("./test/vue.test.js", 1652);
                return removed.reverse();
            } else {
                _$jscoverage_done("./test/vue.test.js", 1654);
                if (_$jscoverage_done("./test/vue.test.js", 1654, typeof index !== "number")) {
                    _$jscoverage_done("./test/vue.test.js", 1655);
                    index = this.indexOf(index);
                }
                _$jscoverage_done("./test/vue.test.js", 1657);
                if (_$jscoverage_done("./test/vue.test.js", 1657, index > -1)) {
                    _$jscoverage_done("./test/vue.test.js", 1658);
                    return this.splice(index, 1)[0];
                }
            }
        },
        replace: function(index, data) {
            _$jscoverage_done("./test/vue.test.js", 1663);
            if (_$jscoverage_done("./test/vue.test.js", 1663, typeof index === "function")) {
                _$jscoverage_done("./test/vue.test.js", 1664);
                var i = this.length, replaced = [], replacer;
                _$jscoverage_done("./test/vue.test.js", 1667);
                while (i--) {
                    _$jscoverage_done("./test/vue.test.js", 1668);
                    replacer = index(this[i]);
                    _$jscoverage_done("./test/vue.test.js", 1669);
                    if (_$jscoverage_done("./test/vue.test.js", 1669, replacer !== undefined)) {
                        _$jscoverage_done("./test/vue.test.js", 1670);
                        replaced.push(this.splice(i, 1, replacer)[0]);
                    }
                }
                _$jscoverage_done("./test/vue.test.js", 1673);
                return replaced.reverse();
            } else {
                _$jscoverage_done("./test/vue.test.js", 1675);
                if (_$jscoverage_done("./test/vue.test.js", 1675, typeof index !== "number")) {
                    _$jscoverage_done("./test/vue.test.js", 1676);
                    index = this.indexOf(index);
                }
                _$jscoverage_done("./test/vue.test.js", 1678);
                if (_$jscoverage_done("./test/vue.test.js", 1678, index > -1)) {
                    _$jscoverage_done("./test/vue.test.js", 1679);
                    return this.splice(index, 1, data)[0];
                }
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 1685);
    for (var method in extensions) {
        _$jscoverage_done("./test/vue.test.js", 1686);
        def(ArrayProxy, method, extensions[method], !hasProto);
    }
    function watch(obj, path, observer) {
        _$jscoverage_done("./test/vue.test.js", 1693);
        var type = typeOf(obj);
        _$jscoverage_done("./test/vue.test.js", 1694);
        if (_$jscoverage_done("./test/vue.test.js", 1694, type === "Object")) {
            _$jscoverage_done("./test/vue.test.js", 1695);
            watchObject(obj, path, observer);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1696);
            if (_$jscoverage_done("./test/vue.test.js", 1696, type === "Array")) {
                _$jscoverage_done("./test/vue.test.js", 1697);
                watchArray(obj, path, observer);
            }
        }
    }
    function watchObject(obj, path, observer) {
        _$jscoverage_done("./test/vue.test.js", 1705);
        for (var key in obj) {
            _$jscoverage_done("./test/vue.test.js", 1706);
            var keyPrefix = key.charAt(0);
            _$jscoverage_done("./test/vue.test.js", 1707);
            if (_$jscoverage_done("./test/vue.test.js", 1707, keyPrefix !== "$") && _$jscoverage_done("./test/vue.test.js", 1707, keyPrefix !== "_")) {
                _$jscoverage_done("./test/vue.test.js", 1708);
                bind(obj, key, path, observer);
            }
        }
    }
    function watchArray(arr, path, observer) {
        _$jscoverage_done("./test/vue.test.js", 1718);
        def(arr, "__observer__", observer);
        _$jscoverage_done("./test/vue.test.js", 1719);
        observer.path = path;
        _$jscoverage_done("./test/vue.test.js", 1720);
        if (_$jscoverage_done("./test/vue.test.js", 1720, hasProto)) {
            _$jscoverage_done("./test/vue.test.js", 1721);
            arr.__proto__ = ArrayProxy;
        } else {
            _$jscoverage_done("./test/vue.test.js", 1723);
            for (var key in ArrayProxy) {
                _$jscoverage_done("./test/vue.test.js", 1724);
                def(arr, key, ArrayProxy[key]);
            }
        }
    }
    function bind(obj, key, path, observer) {
        _$jscoverage_done("./test/vue.test.js", 1735);
        var val = obj[key], watchable = isWatchable(val), values = observer.values, fullKey = (path ? path + "." : "") + key;
        _$jscoverage_done("./test/vue.test.js", 1739);
        values[fullKey] = val;
        _$jscoverage_done("./test/vue.test.js", 1743);
        observer.emit("set", fullKey, val);
        _$jscoverage_done("./test/vue.test.js", 1744);
        Object.defineProperty(obj, key, {
            enumerable: true,
            get: function() {
                _$jscoverage_done("./test/vue.test.js", 1748);
                if (_$jscoverage_done("./test/vue.test.js", 1748, depsOb.active) && _$jscoverage_done("./test/vue.test.js", 1748, !watchable)) {
                    _$jscoverage_done("./test/vue.test.js", 1749);
                    observer.emit("get", fullKey);
                }
                _$jscoverage_done("./test/vue.test.js", 1751);
                return values[fullKey];
            },
            set: function(newVal) {
                _$jscoverage_done("./test/vue.test.js", 1754);
                values[fullKey] = newVal;
                _$jscoverage_done("./test/vue.test.js", 1755);
                ensurePaths(key, newVal, values);
                _$jscoverage_done("./test/vue.test.js", 1756);
                observer.emit("set", fullKey, newVal);
                _$jscoverage_done("./test/vue.test.js", 1757);
                watch(newVal, fullKey, observer);
            }
        });
        _$jscoverage_done("./test/vue.test.js", 1760);
        watch(val, fullKey, observer);
    }
    function isWatchable(obj) {
        _$jscoverage_done("./test/vue.test.js", 1767);
        var type = typeOf(obj);
        _$jscoverage_done("./test/vue.test.js", 1768);
        return type === "Object" || type === "Array";
    }
    function emitSet(obj, observer, set) {
        _$jscoverage_done("./test/vue.test.js", 1778);
        if (_$jscoverage_done("./test/vue.test.js", 1778, typeOf(obj) === "Array")) {
            _$jscoverage_done("./test/vue.test.js", 1779);
            set("length", obj.length);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1781);
            var key, val, values = observer.values;
            _$jscoverage_done("./test/vue.test.js", 1782);
            for (key in observer.values) {
                _$jscoverage_done("./test/vue.test.js", 1783);
                val = values[key];
                _$jscoverage_done("./test/vue.test.js", 1784);
                set(key, val);
            }
        }
    }
    function ensurePaths(key, val, paths) {
        _$jscoverage_done("./test/vue.test.js", 1796);
        key += ".";
        _$jscoverage_done("./test/vue.test.js", 1797);
        for (var path in paths) {
            _$jscoverage_done("./test/vue.test.js", 1798);
            if (_$jscoverage_done("./test/vue.test.js", 1798, !path.indexOf(key))) {
                _$jscoverage_done("./test/vue.test.js", 1799);
                ensurePath(val, path.replace(key, ""));
            }
        }
    }
    function ensurePath(obj, key) {
        _$jscoverage_done("./test/vue.test.js", 1809);
        if (_$jscoverage_done("./test/vue.test.js", 1809, typeOf(obj) !== "Object")) {
            _$jscoverage_done("./test/vue.test.js", 1809);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 1810);
        var path = key.split("."), sec;
        _$jscoverage_done("./test/vue.test.js", 1811);
        for (var i = 0, d = path.length - 1; i < d; i++) {
            _$jscoverage_done("./test/vue.test.js", 1812);
            sec = path[i];
            _$jscoverage_done("./test/vue.test.js", 1813);
            if (_$jscoverage_done("./test/vue.test.js", 1813, !obj[sec])) {
                _$jscoverage_done("./test/vue.test.js", 1813);
                obj[sec] = {};
            }
            _$jscoverage_done("./test/vue.test.js", 1814);
            obj = obj[sec];
        }
        _$jscoverage_done("./test/vue.test.js", 1816);
        if (_$jscoverage_done("./test/vue.test.js", 1816, typeOf(obj) === "Object")) {
            _$jscoverage_done("./test/vue.test.js", 1817);
            sec = path[i];
            _$jscoverage_done("./test/vue.test.js", 1818);
            if (_$jscoverage_done("./test/vue.test.js", 1818, !(sec in obj))) {
                _$jscoverage_done("./test/vue.test.js", 1818);
                obj[sec] = undefined;
            }
        }
    }
    _$jscoverage_done("./test/vue.test.js", 1822);
    module.exports = {
        watchArray: watchArray,
        ensurePath: ensurePath,
        ensurePaths: ensurePaths,
        observe: function(obj, rawPath, observer) {
            _$jscoverage_done("./test/vue.test.js", 1834);
            if (_$jscoverage_done("./test/vue.test.js", 1834, isWatchable(obj))) {
                _$jscoverage_done("./test/vue.test.js", 1835);
                var path = rawPath + ".", ob, alreadyConverted = !!obj.__observer__;
                _$jscoverage_done("./test/vue.test.js", 1837);
                if (_$jscoverage_done("./test/vue.test.js", 1837, !alreadyConverted)) {
                    _$jscoverage_done("./test/vue.test.js", 1838);
                    def(obj, "__observer__", new Emitter);
                }
                _$jscoverage_done("./test/vue.test.js", 1840);
                ob = obj.__observer__;
                _$jscoverage_done("./test/vue.test.js", 1841);
                ob.values = ob.values || utils.hash();
                _$jscoverage_done("./test/vue.test.js", 1842);
                var proxies = observer.proxies[path] = {
                    get: function(key) {
                        _$jscoverage_done("./test/vue.test.js", 1844);
                        observer.emit("get", path + key);
                    },
                    set: function(key, val) {
                        _$jscoverage_done("./test/vue.test.js", 1847);
                        observer.emit("set", path + key, val);
                    },
                    mutate: function(key, val, mutation) {
                        _$jscoverage_done("./test/vue.test.js", 1852);
                        var fixedPath = key ? path + key : rawPath;
                        _$jscoverage_done("./test/vue.test.js", 1853);
                        observer.emit("mutate", fixedPath, val, mutation);
                        _$jscoverage_done("./test/vue.test.js", 1855);
                        var m = mutation.method;
                        _$jscoverage_done("./test/vue.test.js", 1856);
                        if (_$jscoverage_done("./test/vue.test.js", 1856, m !== "sort") && _$jscoverage_done("./test/vue.test.js", 1856, m !== "reverse")) {
                            _$jscoverage_done("./test/vue.test.js", 1857);
                            observer.emit("set", fixedPath + ".length", val.length);
                        }
                    }
                };
                _$jscoverage_done("./test/vue.test.js", 1861);
                ob.on("get", proxies.get).on("set", proxies.set).on("mutate", proxies.mutate);
                _$jscoverage_done("./test/vue.test.js", 1865);
                if (_$jscoverage_done("./test/vue.test.js", 1865, alreadyConverted)) {
                    _$jscoverage_done("./test/vue.test.js", 1866);
                    emitSet(obj, ob, proxies.set);
                } else {
                    _$jscoverage_done("./test/vue.test.js", 1868);
                    watch(obj, null, ob);
                }
            }
        },
        unobserve: function(obj, path, observer) {
            _$jscoverage_done("./test/vue.test.js", 1877);
            if (_$jscoverage_done("./test/vue.test.js", 1877, !obj) || _$jscoverage_done("./test/vue.test.js", 1877, !obj.__observer__)) {
                _$jscoverage_done("./test/vue.test.js", 1877);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 1878);
            path = path + ".";
            _$jscoverage_done("./test/vue.test.js", 1879);
            var proxies = observer.proxies[path];
            _$jscoverage_done("./test/vue.test.js", 1880);
            obj.__observer__.off("get", proxies.get).off("set", proxies.set).off("mutate", proxies.mutate);
            _$jscoverage_done("./test/vue.test.js", 1884);
            observer.proxies[path] = null;
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 1888);
require.register("vue/src/directive.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 1889);
    var config = require("./config"), utils = require("./utils"), directives = require("./directives"), filters = require("./filters"), SPLIT_RE = /(?:['"](?:\\.|[^'"])*['"]|\((?:\\.|[^\)])*\)|\\.|[^,])+/g, KEY_RE = /^(?:['"](?:\\.|[^'"])*['"]|\\.|[^\|]|\|\|)+/, ARG_RE = /^([\w- ]+):(.+)$/, FILTERS_RE = /\|[^\|]+/g, FILTER_TOKEN_RE = /[^\s']+|'[^']+'/g, NESTING_RE = /^\^+/, SINGLE_VAR_RE = /^[\w\.\$]+$/;
    function Directive(definition, expression, rawKey, compiler, node) {
        _$jscoverage_done("./test/vue.test.js", 1915);
        this.compiler = compiler;
        _$jscoverage_done("./test/vue.test.js", 1916);
        this.vm = compiler.vm;
        _$jscoverage_done("./test/vue.test.js", 1917);
        this.el = node;
        _$jscoverage_done("./test/vue.test.js", 1919);
        var isSimple = expression === "";
        _$jscoverage_done("./test/vue.test.js", 1922);
        if (_$jscoverage_done("./test/vue.test.js", 1922, typeof definition === "function")) {
            _$jscoverage_done("./test/vue.test.js", 1923);
            this[isSimple ? "bind" : "_update"] = definition;
        } else {
            _$jscoverage_done("./test/vue.test.js", 1925);
            for (var prop in definition) {
                _$jscoverage_done("./test/vue.test.js", 1926);
                if (_$jscoverage_done("./test/vue.test.js", 1926, prop === "unbind") || _$jscoverage_done("./test/vue.test.js", 1926, prop === "update")) {
                    _$jscoverage_done("./test/vue.test.js", 1927);
                    this["_" + prop] = definition[prop];
                } else {
                    _$jscoverage_done("./test/vue.test.js", 1929);
                    this[prop] = definition[prop];
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1935);
        if (_$jscoverage_done("./test/vue.test.js", 1935, isSimple)) {
            _$jscoverage_done("./test/vue.test.js", 1936);
            this.isSimple = true;
            _$jscoverage_done("./test/vue.test.js", 1937);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 1940);
        this.expression = expression.trim();
        _$jscoverage_done("./test/vue.test.js", 1941);
        this.rawKey = rawKey;
        _$jscoverage_done("./test/vue.test.js", 1943);
        parseKey(this, rawKey);
        _$jscoverage_done("./test/vue.test.js", 1945);
        this.isExp = !SINGLE_VAR_RE.test(this.key);
        _$jscoverage_done("./test/vue.test.js", 1947);
        var filterExps = this.expression.slice(rawKey.length).match(FILTERS_RE);
        _$jscoverage_done("./test/vue.test.js", 1948);
        if (_$jscoverage_done("./test/vue.test.js", 1948, filterExps)) {
            _$jscoverage_done("./test/vue.test.js", 1949);
            this.filters = [];
            _$jscoverage_done("./test/vue.test.js", 1950);
            var i = 0, l = filterExps.length, filter;
            _$jscoverage_done("./test/vue.test.js", 1951);
            for (; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 1952);
                filter = parseFilter(filterExps[i], this.compiler);
                _$jscoverage_done("./test/vue.test.js", 1953);
                if (_$jscoverage_done("./test/vue.test.js", 1953, filter)) {
                    _$jscoverage_done("./test/vue.test.js", 1953);
                    this.filters.push(filter);
                }
            }
            _$jscoverage_done("./test/vue.test.js", 1955);
            if (_$jscoverage_done("./test/vue.test.js", 1955, !this.filters.length)) {
                _$jscoverage_done("./test/vue.test.js", 1955);
                this.filters = null;
            }
        } else {
            _$jscoverage_done("./test/vue.test.js", 1957);
            this.filters = null;
        }
    }
    _$jscoverage_done("./test/vue.test.js", 1961);
    var DirProto = Directive.prototype;
    function parseKey(dir, rawKey) {
        _$jscoverage_done("./test/vue.test.js", 1968);
        var key = rawKey;
        _$jscoverage_done("./test/vue.test.js", 1969);
        if (_$jscoverage_done("./test/vue.test.js", 1969, rawKey.indexOf(":") > -1)) {
            _$jscoverage_done("./test/vue.test.js", 1970);
            var argMatch = rawKey.match(ARG_RE);
            _$jscoverage_done("./test/vue.test.js", 1971);
            key = argMatch ? argMatch[2].trim() : key;
            _$jscoverage_done("./test/vue.test.js", 1974);
            dir.arg = argMatch ? argMatch[1].trim() : null;
        }
        _$jscoverage_done("./test/vue.test.js", 1980);
        var firstChar = key.charAt(0);
        _$jscoverage_done("./test/vue.test.js", 1981);
        dir.root = firstChar === "*";
        _$jscoverage_done("./test/vue.test.js", 1982);
        dir.nesting = firstChar === "^" ? key.match(NESTING_RE)[0].length : false;
        _$jscoverage_done("./test/vue.test.js", 1986);
        if (_$jscoverage_done("./test/vue.test.js", 1986, dir.nesting)) {
            _$jscoverage_done("./test/vue.test.js", 1987);
            key = key.slice(dir.nesting);
        } else {
            _$jscoverage_done("./test/vue.test.js", 1988);
            if (_$jscoverage_done("./test/vue.test.js", 1988, dir.root)) {
                _$jscoverage_done("./test/vue.test.js", 1989);
                key = key.slice(1);
            }
        }
        _$jscoverage_done("./test/vue.test.js", 1992);
        dir.key = key;
    }
    function parseFilter(filter, compiler) {
        _$jscoverage_done("./test/vue.test.js", 2e3);
        var tokens = filter.slice(1).match(FILTER_TOKEN_RE);
        _$jscoverage_done("./test/vue.test.js", 2001);
        if (_$jscoverage_done("./test/vue.test.js", 2001, !tokens)) {
            _$jscoverage_done("./test/vue.test.js", 2001);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2002);
        tokens = tokens.map(function(token) {
            _$jscoverage_done("./test/vue.test.js", 2003);
            return token.replace(/'/g, "").trim();
        });
        _$jscoverage_done("./test/vue.test.js", 2006);
        var name = tokens[0], apply = compiler.getOption("filters", name) || filters[name];
        _$jscoverage_done("./test/vue.test.js", 2008);
        if (_$jscoverage_done("./test/vue.test.js", 2008, !apply)) {
            _$jscoverage_done("./test/vue.test.js", 2009);
            utils.warn("Unknown filter: " + name);
            _$jscoverage_done("./test/vue.test.js", 2010);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2013);
        return {
            name: name,
            apply: apply,
            args: tokens.length > 1 ? tokens.slice(1) : null
        };
    }
    _$jscoverage_done("./test/vue.test.js", 2027);
    DirProto.update = function(value, init) {
        _$jscoverage_done("./test/vue.test.js", 2028);
        if (_$jscoverage_done("./test/vue.test.js", 2028, !init) && _$jscoverage_done("./test/vue.test.js", 2028, value === this.value)) {
            _$jscoverage_done("./test/vue.test.js", 2028);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2029);
        this.value = value;
        _$jscoverage_done("./test/vue.test.js", 2030);
        this.apply(value);
    };
    _$jscoverage_done("./test/vue.test.js", 2037);
    DirProto.refresh = function(value) {
        _$jscoverage_done("./test/vue.test.js", 2040);
        if (_$jscoverage_done("./test/vue.test.js", 2040, value)) {
            _$jscoverage_done("./test/vue.test.js", 2040);
            this.value = value;
        }
        _$jscoverage_done("./test/vue.test.js", 2042);
        if (_$jscoverage_done("./test/vue.test.js", 2042, this.isFn)) {
            _$jscoverage_done("./test/vue.test.js", 2043);
            value = this.value;
        } else {
            _$jscoverage_done("./test/vue.test.js", 2045);
            value = this.value.$get();
            _$jscoverage_done("./test/vue.test.js", 2046);
            if (_$jscoverage_done("./test/vue.test.js", 2046, value !== undefined) && _$jscoverage_done("./test/vue.test.js", 2046, value === this.computedValue)) {
                _$jscoverage_done("./test/vue.test.js", 2046);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2047);
            this.computedValue = value;
        }
        _$jscoverage_done("./test/vue.test.js", 2049);
        this.apply(value);
    };
    _$jscoverage_done("./test/vue.test.js", 2055);
    DirProto.apply = function(value) {
        _$jscoverage_done("./test/vue.test.js", 2056);
        this._update(this.filters ? this.applyFilters(value) : value);
    };
    _$jscoverage_done("./test/vue.test.js", 2066);
    DirProto.applyFilters = function(value) {
        _$jscoverage_done("./test/vue.test.js", 2067);
        var filtered = value, filter;
        _$jscoverage_done("./test/vue.test.js", 2068);
        for (var i = 0, l = this.filters.length; i < l; i++) {
            _$jscoverage_done("./test/vue.test.js", 2069);
            filter = this.filters[i];
            _$jscoverage_done("./test/vue.test.js", 2070);
            filtered = filter.apply.call(this.vm, filtered, filter.args);
        }
        _$jscoverage_done("./test/vue.test.js", 2072);
        return filtered;
    };
    _$jscoverage_done("./test/vue.test.js", 2082);
    DirProto.unbind = function(update) {
        _$jscoverage_done("./test/vue.test.js", 2084);
        if (_$jscoverage_done("./test/vue.test.js", 2084, !this.el)) {
            _$jscoverage_done("./test/vue.test.js", 2084);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2085);
        if (_$jscoverage_done("./test/vue.test.js", 2085, this._unbind)) {
            _$jscoverage_done("./test/vue.test.js", 2085);
            this._unbind(update);
        }
        _$jscoverage_done("./test/vue.test.js", 2086);
        if (_$jscoverage_done("./test/vue.test.js", 2086, !update)) {
            _$jscoverage_done("./test/vue.test.js", 2086);
            this.vm = this.el = this.binding = this.compiler = null;
        }
    };
    _$jscoverage_done("./test/vue.test.js", 2095);
    Directive.split = function(exp) {
        _$jscoverage_done("./test/vue.test.js", 2096);
        return exp.indexOf(",") > -1 ? exp.match(SPLIT_RE) || [ "" ] : [ exp ];
    };
    _$jscoverage_done("./test/vue.test.js", 2105);
    Directive.parse = function(dirname, expression, compiler, node) {
        _$jscoverage_done("./test/vue.test.js", 2107);
        var prefix = config.prefix + "-";
        _$jscoverage_done("./test/vue.test.js", 2108);
        if (_$jscoverage_done("./test/vue.test.js", 2108, dirname.indexOf(prefix) !== 0)) {
            _$jscoverage_done("./test/vue.test.js", 2108);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2109);
        dirname = dirname.slice(prefix.length);
        _$jscoverage_done("./test/vue.test.js", 2111);
        var dir = compiler.getOption("directives", dirname) || directives[dirname];
        _$jscoverage_done("./test/vue.test.js", 2112);
        if (_$jscoverage_done("./test/vue.test.js", 2112, !dir)) {
            _$jscoverage_done("./test/vue.test.js", 2112);
            return utils.warn("unknown directive: " + dirname);
        }
        _$jscoverage_done("./test/vue.test.js", 2114);
        var rawKey;
        _$jscoverage_done("./test/vue.test.js", 2115);
        if (_$jscoverage_done("./test/vue.test.js", 2115, expression.indexOf("|") > -1)) {
            _$jscoverage_done("./test/vue.test.js", 2116);
            var keyMatch = expression.match(KEY_RE);
            _$jscoverage_done("./test/vue.test.js", 2117);
            if (_$jscoverage_done("./test/vue.test.js", 2117, keyMatch)) {
                _$jscoverage_done("./test/vue.test.js", 2118);
                rawKey = keyMatch[0].trim();
            }
        } else {
            _$jscoverage_done("./test/vue.test.js", 2121);
            rawKey = expression.trim();
        }
        _$jscoverage_done("./test/vue.test.js", 2125);
        return rawKey || expression === "" ? new Directive(dir, expression, rawKey, compiler, node) : utils.warn("invalid directive expression: " + expression);
    };
    _$jscoverage_done("./test/vue.test.js", 2130);
    module.exports = Directive;
});

_$jscoverage_done("./test/vue.test.js", 2132);
require.register("vue/src/exp-parser.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2133);
    var utils = require("./utils"), hasOwn = Object.prototype.hasOwnProperty;
    _$jscoverage_done("./test/vue.test.js", 2138);
    var KEYWORDS = "break,case,catch,continue,debugger,default,delete,do,else,false" + ",finally,for,function,if,in,instanceof,new,null,return,switch,this" + ",throw,true,try,typeof,var,void,while,with,undefined" + ",abstract,boolean,byte,char,class,const,double,enum,export,extends" + ",final,float,goto,implements,import,int,interface,long,native" + ",package,private,protected,public,short,static,super,synchronized" + ",throws,transient,volatile" + ",arguments,let,yield" + ",Math", KEYWORDS_RE = new RegExp([ "\\b" + KEYWORDS.replace(/,/g, "\\b|\\b") + "\\b" ].join("|"), "g"), REMOVE_RE = /\/\*(?:.|\n)*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|'[^']*'|"[^"]*"|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g, SPLIT_RE = /[^\w$]+/g, NUMBER_RE = /\b\d[^,]*/g, BOUNDARY_RE = /^,+|,+$/g;
    function getVariables(code) {
        _$jscoverage_done("./test/vue.test.js", 2163);
        code = code.replace(REMOVE_RE, "").replace(SPLIT_RE, ",").replace(KEYWORDS_RE, "").replace(NUMBER_RE, "").replace(BOUNDARY_RE, "");
        _$jscoverage_done("./test/vue.test.js", 2169);
        return code ? code.split(/,+/) : [];
    }
    function getRel(path, compiler) {
        _$jscoverage_done("./test/vue.test.js", 2186);
        var rel = "", vm = compiler.vm, dot = path.indexOf("."), key = dot > -1 ? path.slice(0, dot) : path;
        _$jscoverage_done("./test/vue.test.js", 2192);
        while (true) {
            _$jscoverage_done("./test/vue.test.js", 2193);
            if (_$jscoverage_done("./test/vue.test.js", 2193, hasOwn.call(vm, key))) {
                _$jscoverage_done("./test/vue.test.js", 2194);
                break;
            } else {
                _$jscoverage_done("./test/vue.test.js", 2196);
                if (_$jscoverage_done("./test/vue.test.js", 2196, vm.$parent)) {
                    _$jscoverage_done("./test/vue.test.js", 2197);
                    vm = vm.$parent;
                    _$jscoverage_done("./test/vue.test.js", 2198);
                    rel += "$parent.";
                } else {
                    _$jscoverage_done("./test/vue.test.js", 2200);
                    break;
                }
            }
        }
        _$jscoverage_done("./test/vue.test.js", 2204);
        compiler = vm.$compiler;
        _$jscoverage_done("./test/vue.test.js", 2205);
        if (_$jscoverage_done("./test/vue.test.js", 2205, !hasOwn.call(compiler.bindings, path)) && _$jscoverage_done("./test/vue.test.js", 2205, path.charAt(0) !== "$")) {
            _$jscoverage_done("./test/vue.test.js", 2209);
            compiler.createBinding(path);
        }
        _$jscoverage_done("./test/vue.test.js", 2211);
        return rel;
    }
    function makeGetter(exp, raw) {
        _$jscoverage_done("./test/vue.test.js", 2221);
        var fn;
        _$jscoverage_done("./test/vue.test.js", 2222);
        try {
            _$jscoverage_done("./test/vue.test.js", 2223);
            fn = new Function(exp);
        } catch (e) {
            _$jscoverage_done("./test/vue.test.js", 2225);
            utils.warn("Invalid expression: " + raw);
        }
        _$jscoverage_done("./test/vue.test.js", 2227);
        return fn;
    }
    function escapeDollar(v) {
        _$jscoverage_done("./test/vue.test.js", 2234);
        return v.charAt(0) === "$" ? "\\" + v : v;
    }
    _$jscoverage_done("./test/vue.test.js", 2239);
    module.exports = {
        parse: function(exp, compiler) {
            _$jscoverage_done("./test/vue.test.js", 2248);
            var vars = getVariables(exp);
            _$jscoverage_done("./test/vue.test.js", 2249);
            if (_$jscoverage_done("./test/vue.test.js", 2249, !vars.length)) {
                _$jscoverage_done("./test/vue.test.js", 2250);
                return makeGetter("return " + exp, exp);
            }
            _$jscoverage_done("./test/vue.test.js", 2252);
            vars = utils.unique(vars);
            _$jscoverage_done("./test/vue.test.js", 2253);
            var accessors = "", pathRE = new RegExp("[^$\\w\\.](" + vars.map(escapeDollar).join("|") + ")[$\\w\\.]*\\b", "g"), body = ("return " + exp).replace(pathRE, function(path) {
                _$jscoverage_done("./test/vue.test.js", 2264);
                var c = path.charAt(0);
                _$jscoverage_done("./test/vue.test.js", 2265);
                path = path.slice(1);
                _$jscoverage_done("./test/vue.test.js", 2266);
                var val = "this." + getRel(path, compiler) + path;
                _$jscoverage_done("./test/vue.test.js", 2267);
                accessors += val + ";";
                _$jscoverage_done("./test/vue.test.js", 2269);
                return c + val;
            });
            _$jscoverage_done("./test/vue.test.js", 2271);
            body = accessors + body;
            _$jscoverage_done("./test/vue.test.js", 2272);
            return makeGetter(body, exp);
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2276);
require.register("vue/src/text-parser.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2277);
    var BINDING_RE = /\{\{(.+?)\}\}/;
    _$jscoverage_done("./test/vue.test.js", 2279);
    module.exports = {
        parse: function(text) {
            _$jscoverage_done("./test/vue.test.js", 2285);
            if (_$jscoverage_done("./test/vue.test.js", 2285, !BINDING_RE.test(text))) {
                _$jscoverage_done("./test/vue.test.js", 2285);
                return null;
            }
            _$jscoverage_done("./test/vue.test.js", 2286);
            var m, i, tokens = [];
            _$jscoverage_done("./test/vue.test.js", 2288);
            while (m = text.match(BINDING_RE)) {
                _$jscoverage_done("./test/vue.test.js", 2289);
                i = m.index;
                _$jscoverage_done("./test/vue.test.js", 2290);
                if (_$jscoverage_done("./test/vue.test.js", 2290, i > 0)) {
                    _$jscoverage_done("./test/vue.test.js", 2290);
                    tokens.push(text.slice(0, i));
                }
                _$jscoverage_done("./test/vue.test.js", 2291);
                tokens.push({
                    key: m[1].trim()
                });
                _$jscoverage_done("./test/vue.test.js", 2292);
                text = text.slice(i + m[0].length);
            }
            _$jscoverage_done("./test/vue.test.js", 2294);
            if (_$jscoverage_done("./test/vue.test.js", 2294, text.length)) {
                _$jscoverage_done("./test/vue.test.js", 2294);
                tokens.push(text);
            }
            _$jscoverage_done("./test/vue.test.js", 2295);
            return tokens;
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2300);
require.register("vue/src/deps-parser.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2301);
    var Emitter = require("./emitter"), utils = require("./utils"), observer = new Emitter;
    function catchDeps(binding) {
        _$jscoverage_done("./test/vue.test.js", 2310);
        if (_$jscoverage_done("./test/vue.test.js", 2310, binding.isFn)) {
            _$jscoverage_done("./test/vue.test.js", 2310);
            return;
        }
        _$jscoverage_done("./test/vue.test.js", 2311);
        utils.log("\n─ " + binding.key);
        _$jscoverage_done("./test/vue.test.js", 2312);
        var depsHash = utils.hash();
        _$jscoverage_done("./test/vue.test.js", 2313);
        observer.on("get", function(dep) {
            _$jscoverage_done("./test/vue.test.js", 2314);
            if (_$jscoverage_done("./test/vue.test.js", 2314, depsHash[dep.key])) {
                _$jscoverage_done("./test/vue.test.js", 2314);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2315);
            depsHash[dep.key] = 1;
            _$jscoverage_done("./test/vue.test.js", 2316);
            utils.log("  └─ " + dep.key);
            _$jscoverage_done("./test/vue.test.js", 2317);
            binding.deps.push(dep);
            _$jscoverage_done("./test/vue.test.js", 2318);
            dep.subs.push(binding);
        });
        _$jscoverage_done("./test/vue.test.js", 2320);
        binding.value.$get();
        _$jscoverage_done("./test/vue.test.js", 2321);
        observer.off("get");
    }
    _$jscoverage_done("./test/vue.test.js", 2324);
    module.exports = {
        observer: observer,
        parse: function(bindings) {
            _$jscoverage_done("./test/vue.test.js", 2335);
            utils.log("\nparsing dependencies...");
            _$jscoverage_done("./test/vue.test.js", 2336);
            observer.active = true;
            _$jscoverage_done("./test/vue.test.js", 2337);
            bindings.forEach(catchDeps);
            _$jscoverage_done("./test/vue.test.js", 2338);
            observer.active = false;
            _$jscoverage_done("./test/vue.test.js", 2339);
            utils.log("\ndone.");
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2344);
require.register("vue/src/filters.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2345);
    var keyCodes = {
        enter: 13,
        tab: 9,
        "delete": 46,
        up: 38,
        left: 37,
        right: 39,
        down: 40,
        esc: 27
    };
    _$jscoverage_done("./test/vue.test.js", 2356);
    module.exports = {
        capitalize: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2362);
            if (_$jscoverage_done("./test/vue.test.js", 2362, !value) && _$jscoverage_done("./test/vue.test.js", 2362, value !== 0)) {
                _$jscoverage_done("./test/vue.test.js", 2362);
                return "";
            }
            _$jscoverage_done("./test/vue.test.js", 2363);
            value = value.toString();
            _$jscoverage_done("./test/vue.test.js", 2364);
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        uppercase: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2371);
            return value || value === 0 ? value.toString().toUpperCase() : "";
        },
        lowercase: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2380);
            return value || value === 0 ? value.toString().toLowerCase() : "";
        },
        currency: function(value, args) {
            _$jscoverage_done("./test/vue.test.js", 2389);
            if (_$jscoverage_done("./test/vue.test.js", 2389, !value) && _$jscoverage_done("./test/vue.test.js", 2389, value !== 0)) {
                _$jscoverage_done("./test/vue.test.js", 2389);
                return "";
            }
            _$jscoverage_done("./test/vue.test.js", 2390);
            var sign = args && args[0] || "$", s = Math.floor(value).toString(), i = s.length % 3, h = i > 0 ? s.slice(0, i) + (s.length > 3 ? "," : "") : "", f = "." + value.toFixed(2).slice(-2);
            _$jscoverage_done("./test/vue.test.js", 2395);
            return sign + h + s.slice(i).replace(/(\d{3})(?=\d)/g, "$1,") + f;
        },
        pluralize: function(value, args) {
            _$jscoverage_done("./test/vue.test.js", 2408);
            return args.length > 1 ? args[value - 1] || args[args.length - 1] : args[value - 1] || args[0] + "s";
        },
        key: function(handler, args) {
            _$jscoverage_done("./test/vue.test.js", 2418);
            if (_$jscoverage_done("./test/vue.test.js", 2418, !handler)) {
                _$jscoverage_done("./test/vue.test.js", 2418);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2419);
            var code = keyCodes[args[0]];
            _$jscoverage_done("./test/vue.test.js", 2420);
            if (_$jscoverage_done("./test/vue.test.js", 2420, !code)) {
                _$jscoverage_done("./test/vue.test.js", 2421);
                code = parseInt(args[0], 10);
            }
            _$jscoverage_done("./test/vue.test.js", 2423);
            return function(e) {
                _$jscoverage_done("./test/vue.test.js", 2424);
                if (_$jscoverage_done("./test/vue.test.js", 2424, e.keyCode === code)) {
                    _$jscoverage_done("./test/vue.test.js", 2425);
                    handler.call(this, e);
                }
            };
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2431);
require.register("vue/src/transition.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2432);
    var endEvent = sniffTransitionEndEvent(), config = require("./config"), enterClass = config.enterClass, leaveClass = config.leaveClass, codes = {
        CSS_E: 1,
        CSS_L: 2,
        JS_E: 3,
        JS_L: 4,
        CSS_SKIP: -1,
        JS_SKIP: -2,
        JS_SKIP_E: -3,
        JS_SKIP_L: -4,
        INIT: -5,
        SKIP: -6
    };
    _$jscoverage_done("./test/vue.test.js", 2455);
    var transition = module.exports = function(el, stage, changeState, compiler) {
        _$jscoverage_done("./test/vue.test.js", 2457);
        if (_$jscoverage_done("./test/vue.test.js", 2457, compiler.init)) {
            _$jscoverage_done("./test/vue.test.js", 2458);
            changeState();
            _$jscoverage_done("./test/vue.test.js", 2459);
            return codes.INIT;
        }
        _$jscoverage_done("./test/vue.test.js", 2462);
        var transitionId = el.vue_trans;
        _$jscoverage_done("./test/vue.test.js", 2464);
        if (_$jscoverage_done("./test/vue.test.js", 2464, transitionId)) {
            _$jscoverage_done("./test/vue.test.js", 2465);
            return applyTransitionFunctions(el, stage, changeState, transitionId, compiler);
        } else {
            _$jscoverage_done("./test/vue.test.js", 2472);
            if (_$jscoverage_done("./test/vue.test.js", 2472, transitionId === "")) {
                _$jscoverage_done("./test/vue.test.js", 2473);
                return applyTransitionClass(el, stage, changeState);
            } else {
                _$jscoverage_done("./test/vue.test.js", 2479);
                changeState();
                _$jscoverage_done("./test/vue.test.js", 2480);
                return codes.SKIP;
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 2485);
    transition.codes = codes;
    function applyTransitionClass(el, stage, changeState) {
        _$jscoverage_done("./test/vue.test.js", 2492);
        if (_$jscoverage_done("./test/vue.test.js", 2492, !endEvent)) {
            _$jscoverage_done("./test/vue.test.js", 2493);
            changeState();
            _$jscoverage_done("./test/vue.test.js", 2494);
            return codes.CSS_SKIP;
        }
        _$jscoverage_done("./test/vue.test.js", 2497);
        var classList = el.classList, lastLeaveCallback = el.vue_trans_cb;
        _$jscoverage_done("./test/vue.test.js", 2500);
        if (_$jscoverage_done("./test/vue.test.js", 2500, stage > 0)) {
            _$jscoverage_done("./test/vue.test.js", 2503);
            if (_$jscoverage_done("./test/vue.test.js", 2503, lastLeaveCallback)) {
                _$jscoverage_done("./test/vue.test.js", 2504);
                el.removeEventListener(endEvent, lastLeaveCallback);
                _$jscoverage_done("./test/vue.test.js", 2505);
                el.vue_trans_cb = null;
            }
            _$jscoverage_done("./test/vue.test.js", 2509);
            classList.add(enterClass);
            _$jscoverage_done("./test/vue.test.js", 2511);
            changeState();
            _$jscoverage_done("./test/vue.test.js", 2514);
            var forceLayout = el.clientHeight;
            _$jscoverage_done("./test/vue.test.js", 2516);
            classList.remove(enterClass);
            _$jscoverage_done("./test/vue.test.js", 2517);
            return codes.CSS_E;
        } else {
            _$jscoverage_done("./test/vue.test.js", 2522);
            classList.add(leaveClass);
            _$jscoverage_done("./test/vue.test.js", 2523);
            var onEnd = function(e) {
                _$jscoverage_done("./test/vue.test.js", 2524);
                if (_$jscoverage_done("./test/vue.test.js", 2524, e.target === el)) {
                    _$jscoverage_done("./test/vue.test.js", 2525);
                    el.removeEventListener(endEvent, onEnd);
                    _$jscoverage_done("./test/vue.test.js", 2526);
                    el.vue_trans_cb = null;
                    _$jscoverage_done("./test/vue.test.js", 2528);
                    changeState();
                    _$jscoverage_done("./test/vue.test.js", 2529);
                    classList.remove(leaveClass);
                }
            };
            _$jscoverage_done("./test/vue.test.js", 2533);
            el.addEventListener(endEvent, onEnd);
            _$jscoverage_done("./test/vue.test.js", 2534);
            el.vue_trans_cb = onEnd;
            _$jscoverage_done("./test/vue.test.js", 2535);
            return codes.CSS_L;
        }
    }
    function applyTransitionFunctions(el, stage, changeState, functionId, compiler) {
        _$jscoverage_done("./test/vue.test.js", 2543);
        var funcs = compiler.getOption("transitions", functionId);
        _$jscoverage_done("./test/vue.test.js", 2544);
        if (_$jscoverage_done("./test/vue.test.js", 2544, !funcs)) {
            _$jscoverage_done("./test/vue.test.js", 2545);
            changeState();
            _$jscoverage_done("./test/vue.test.js", 2546);
            return codes.JS_SKIP;
        }
        _$jscoverage_done("./test/vue.test.js", 2549);
        var enter = funcs.enter, leave = funcs.leave;
        _$jscoverage_done("./test/vue.test.js", 2552);
        if (_$jscoverage_done("./test/vue.test.js", 2552, stage > 0)) {
            _$jscoverage_done("./test/vue.test.js", 2553);
            if (_$jscoverage_done("./test/vue.test.js", 2553, typeof enter !== "function")) {
                _$jscoverage_done("./test/vue.test.js", 2554);
                changeState();
                _$jscoverage_done("./test/vue.test.js", 2555);
                return codes.JS_SKIP_E;
            }
            _$jscoverage_done("./test/vue.test.js", 2557);
            enter(el, changeState);
            _$jscoverage_done("./test/vue.test.js", 2558);
            return codes.JS_E;
        } else {
            _$jscoverage_done("./test/vue.test.js", 2560);
            if (_$jscoverage_done("./test/vue.test.js", 2560, typeof leave !== "function")) {
                _$jscoverage_done("./test/vue.test.js", 2561);
                changeState();
                _$jscoverage_done("./test/vue.test.js", 2562);
                return codes.JS_SKIP_L;
            }
            _$jscoverage_done("./test/vue.test.js", 2564);
            leave(el, changeState);
            _$jscoverage_done("./test/vue.test.js", 2565);
            return codes.JS_L;
        }
    }
    function sniffTransitionEndEvent() {
        _$jscoverage_done("./test/vue.test.js", 2574);
        var el = document.createElement("vue"), defaultEvent = "transitionend", events = {
            transition: defaultEvent,
            MozTransition: defaultEvent,
            WebkitTransition: "webkitTransitionEnd"
        };
        _$jscoverage_done("./test/vue.test.js", 2581);
        for (var name in events) {
            _$jscoverage_done("./test/vue.test.js", 2582);
            if (_$jscoverage_done("./test/vue.test.js", 2582, el.style[name] !== undefined)) {
                _$jscoverage_done("./test/vue.test.js", 2583);
                return events[name];
            }
        }
    }
});

_$jscoverage_done("./test/vue.test.js", 2588);
require.register("vue/src/directives/index.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2589);
    var utils = require("../utils"), transition = require("../transition");
    _$jscoverage_done("./test/vue.test.js", 2592);
    module.exports = {
        on: require("./on"),
        repeat: require("./repeat"),
        model: require("./model"),
        "if": require("./if"),
        attr: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2600);
            this.el.setAttribute(this.arg, value);
        },
        text: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2604);
            this.el.textContent = utils.toText(value);
        },
        html: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2608);
            this.el.innerHTML = utils.toText(value);
        },
        visible: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2612);
            this.el.style.visibility = value ? "" : "hidden";
        },
        show: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2616);
            var el = this.el, target = value ? "" : "none", change = function() {
                _$jscoverage_done("./test/vue.test.js", 2619);
                el.style.display = target;
            };
            _$jscoverage_done("./test/vue.test.js", 2621);
            transition(el, value ? 1 : -1, change, this.compiler);
        },
        "class": function(value) {
            _$jscoverage_done("./test/vue.test.js", 2625);
            if (_$jscoverage_done("./test/vue.test.js", 2625, this.arg)) {
                _$jscoverage_done("./test/vue.test.js", 2626);
                this.el.classList[value ? "add" : "remove"](this.arg);
            } else {
                _$jscoverage_done("./test/vue.test.js", 2628);
                if (_$jscoverage_done("./test/vue.test.js", 2628, this.lastVal)) {
                    _$jscoverage_done("./test/vue.test.js", 2629);
                    this.el.classList.remove(this.lastVal);
                }
                _$jscoverage_done("./test/vue.test.js", 2631);
                if (_$jscoverage_done("./test/vue.test.js", 2631, value)) {
                    _$jscoverage_done("./test/vue.test.js", 2632);
                    this.el.classList.add(value);
                    _$jscoverage_done("./test/vue.test.js", 2633);
                    this.lastVal = value;
                }
            }
        },
        style: {
            bind: function() {
                _$jscoverage_done("./test/vue.test.js", 2640);
                this.arg = convertCSSProperty(this.arg);
            },
            update: function(value) {
                _$jscoverage_done("./test/vue.test.js", 2643);
                this.el.style[this.arg] = value;
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 2651);
    var CONVERT_RE = /-(.)/g;
    function convertCSSProperty(prop) {
        _$jscoverage_done("./test/vue.test.js", 2653);
        if (_$jscoverage_done("./test/vue.test.js", 2653, prop.charAt(0) === "-")) {
            _$jscoverage_done("./test/vue.test.js", 2653);
            prop = prop.slice(1);
        }
        _$jscoverage_done("./test/vue.test.js", 2654);
        return prop.replace(CONVERT_RE, function(m, char) {
            _$jscoverage_done("./test/vue.test.js", 2655);
            return char.toUpperCase();
        });
    }
});

_$jscoverage_done("./test/vue.test.js", 2659);
require.register("vue/src/directives/if.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2660);
    var config = require("../config"), transition = require("../transition");
    _$jscoverage_done("./test/vue.test.js", 2663);
    module.exports = {
        bind: function() {
            _$jscoverage_done("./test/vue.test.js", 2666);
            this.parent = this.el.parentNode;
            _$jscoverage_done("./test/vue.test.js", 2667);
            this.ref = document.createComment(config.prefix + "-if-" + this.key);
            _$jscoverage_done("./test/vue.test.js", 2668);
            this.el.vue_ref = this.ref;
        },
        update: function(value) {
            _$jscoverage_done("./test/vue.test.js", 2673);
            var el = this.el;
            _$jscoverage_done("./test/vue.test.js", 2675);
            if (_$jscoverage_done("./test/vue.test.js", 2675, !this.parent)) {
                _$jscoverage_done("./test/vue.test.js", 2676);
                if (_$jscoverage_done("./test/vue.test.js", 2676, !el.parentNode)) {
                    _$jscoverage_done("./test/vue.test.js", 2677);
                    return;
                } else {
                    _$jscoverage_done("./test/vue.test.js", 2679);
                    this.parent = el.parentNode;
                }
            }
            _$jscoverage_done("./test/vue.test.js", 2684);
            var parent = this.parent, ref = this.ref, compiler = this.compiler;
            _$jscoverage_done("./test/vue.test.js", 2688);
            if (_$jscoverage_done("./test/vue.test.js", 2688, !value)) {
                _$jscoverage_done("./test/vue.test.js", 2689);
                transition(el, -1, remove, compiler);
            } else {
                _$jscoverage_done("./test/vue.test.js", 2691);
                transition(el, 1, insert, compiler);
            }
            function remove() {
                _$jscoverage_done("./test/vue.test.js", 2695);
                if (_$jscoverage_done("./test/vue.test.js", 2695, !el.parentNode)) {
                    _$jscoverage_done("./test/vue.test.js", 2695);
                    return;
                }
                _$jscoverage_done("./test/vue.test.js", 2697);
                var next = el.nextSibling;
                _$jscoverage_done("./test/vue.test.js", 2698);
                if (_$jscoverage_done("./test/vue.test.js", 2698, next)) {
                    _$jscoverage_done("./test/vue.test.js", 2699);
                    parent.insertBefore(ref, next);
                } else {
                    _$jscoverage_done("./test/vue.test.js", 2701);
                    parent.appendChild(ref);
                }
                _$jscoverage_done("./test/vue.test.js", 2703);
                parent.removeChild(el);
            }
            function insert() {
                _$jscoverage_done("./test/vue.test.js", 2707);
                if (_$jscoverage_done("./test/vue.test.js", 2707, el.parentNode)) {
                    _$jscoverage_done("./test/vue.test.js", 2707);
                    return;
                }
                _$jscoverage_done("./test/vue.test.js", 2708);
                parent.insertBefore(el, ref);
                _$jscoverage_done("./test/vue.test.js", 2709);
                parent.removeChild(ref);
            }
        },
        unbind: function() {
            _$jscoverage_done("./test/vue.test.js", 2714);
            this.el.vue_ref = null;
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2718);
require.register("vue/src/directives/repeat.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2719);
    var Observer = require("../observer"), Emitter = require("../emitter"), utils = require("../utils"), config = require("../config"), transition = require("../transition"), ViewModel;
    _$jscoverage_done("./test/vue.test.js", 2730);
    var mutationHandlers = {
        push: function(m) {
            _$jscoverage_done("./test/vue.test.js", 2733);
            var i, l = m.args.length, base = this.collection.length - l;
            _$jscoverage_done("./test/vue.test.js", 2735);
            for (i = 0; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2736);
                this.buildItem(m.args[i], base + i);
            }
        },
        pop: function() {
            _$jscoverage_done("./test/vue.test.js", 2741);
            var vm = this.vms.pop();
            _$jscoverage_done("./test/vue.test.js", 2742);
            if (_$jscoverage_done("./test/vue.test.js", 2742, vm)) {
                _$jscoverage_done("./test/vue.test.js", 2742);
                vm.$destroy();
            }
        },
        unshift: function(m) {
            _$jscoverage_done("./test/vue.test.js", 2746);
            var i, l = m.args.length;
            _$jscoverage_done("./test/vue.test.js", 2747);
            for (i = 0; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2748);
                this.buildItem(m.args[i], i);
            }
        },
        shift: function() {
            _$jscoverage_done("./test/vue.test.js", 2753);
            var vm = this.vms.shift();
            _$jscoverage_done("./test/vue.test.js", 2754);
            if (_$jscoverage_done("./test/vue.test.js", 2754, vm)) {
                _$jscoverage_done("./test/vue.test.js", 2754);
                vm.$destroy();
            }
        },
        splice: function(m) {
            _$jscoverage_done("./test/vue.test.js", 2758);
            var i, l, index = m.args[0], removed = m.args[1], added = m.args.length - 2, removedVMs = this.vms.splice(index, removed);
            _$jscoverage_done("./test/vue.test.js", 2763);
            for (i = 0, l = removedVMs.length; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2764);
                removedVMs[i].$destroy();
            }
            _$jscoverage_done("./test/vue.test.js", 2766);
            for (i = 0; i < added; i++) {
                _$jscoverage_done("./test/vue.test.js", 2767);
                this.buildItem(m.args[i + 2], index + i);
            }
        },
        sort: function() {
            _$jscoverage_done("./test/vue.test.js", 2772);
            var key = this.arg, vms = this.vms, col = this.collection, l = col.length, sorted = new Array(l), i, j, vm, data;
            _$jscoverage_done("./test/vue.test.js", 2778);
            for (i = 0; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2779);
                data = col[i];
                _$jscoverage_done("./test/vue.test.js", 2780);
                for (j = 0; j < l; j++) {
                    _$jscoverage_done("./test/vue.test.js", 2781);
                    vm = vms[j];
                    _$jscoverage_done("./test/vue.test.js", 2782);
                    if (_$jscoverage_done("./test/vue.test.js", 2782, vm[key] === data)) {
                        _$jscoverage_done("./test/vue.test.js", 2783);
                        sorted[i] = vm;
                        _$jscoverage_done("./test/vue.test.js", 2784);
                        break;
                    }
                }
            }
            _$jscoverage_done("./test/vue.test.js", 2788);
            for (i = 0; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2789);
                this.container.insertBefore(sorted[i].$el, this.ref);
            }
            _$jscoverage_done("./test/vue.test.js", 2791);
            this.vms = sorted;
        },
        reverse: function() {
            _$jscoverage_done("./test/vue.test.js", 2795);
            var vms = this.vms;
            _$jscoverage_done("./test/vue.test.js", 2796);
            vms.reverse();
            _$jscoverage_done("./test/vue.test.js", 2797);
            for (var i = 0, l = vms.length; i < l; i++) {
                _$jscoverage_done("./test/vue.test.js", 2798);
                this.container.insertBefore(vms[i].$el, this.ref);
            }
        }
    };
    _$jscoverage_done("./test/vue.test.js", 2803);
    module.exports = {
        bind: function() {
            _$jscoverage_done("./test/vue.test.js", 2807);
            var self = this, el = self.el, ctn = self.container = el.parentNode;
            _$jscoverage_done("./test/vue.test.js", 2812);
            ViewModel = ViewModel || require("../viewmodel");
            _$jscoverage_done("./test/vue.test.js", 2813);
            var componentId = utils.attr(el, "component");
            _$jscoverage_done("./test/vue.test.js", 2814);
            self.ChildVM = self.compiler.getOption("components", componentId) || ViewModel;
            _$jscoverage_done("./test/vue.test.js", 2817);
            self.hasTrans = el.hasAttribute(config.attrs.transition);
            _$jscoverage_done("./test/vue.test.js", 2820);
            self.ref = document.createComment(config.prefix + "-repeat-" + self.arg);
            _$jscoverage_done("./test/vue.test.js", 2821);
            ctn.insertBefore(self.ref, el);
            _$jscoverage_done("./test/vue.test.js", 2822);
            ctn.removeChild(el);
            _$jscoverage_done("./test/vue.test.js", 2824);
            self.initiated = false;
            _$jscoverage_done("./test/vue.test.js", 2825);
            self.collection = null;
            _$jscoverage_done("./test/vue.test.js", 2826);
            self.vms = null;
            _$jscoverage_done("./test/vue.test.js", 2827);
            self.mutationListener = function(path, arr, mutation) {
                _$jscoverage_done("./test/vue.test.js", 2828);
                self.detach();
                _$jscoverage_done("./test/vue.test.js", 2829);
                var method = mutation.method;
                _$jscoverage_done("./test/vue.test.js", 2830);
                mutationHandlers[method].call(self, mutation);
                _$jscoverage_done("./test/vue.test.js", 2831);
                if (_$jscoverage_done("./test/vue.test.js", 2831, method !== "push") && _$jscoverage_done("./test/vue.test.js", 2831, method !== "pop")) {
                    _$jscoverage_done("./test/vue.test.js", 2832);
                    self.updateIndexes();
                }
                _$jscoverage_done("./test/vue.test.js", 2834);
                self.retach();
            };
        },
        update: function(collection) {
            _$jscoverage_done("./test/vue.test.js", 2841);
            this.unbind(true);
            _$jscoverage_done("./test/vue.test.js", 2843);
            this.container.vue_dHandlers = utils.hash();
            _$jscoverage_done("./test/vue.test.js", 2847);
            if (_$jscoverage_done("./test/vue.test.js", 2847, !this.initiated) && (_$jscoverage_done("./test/vue.test.js", 2847, !collection) || _$jscoverage_done("./test/vue.test.js", 2847, !collection.length))) {
                _$jscoverage_done("./test/vue.test.js", 2848);
                this.buildItem();
                _$jscoverage_done("./test/vue.test.js", 2849);
                this.initiated = true;
            }
            _$jscoverage_done("./test/vue.test.js", 2851);
            collection = this.collection = collection || [];
            _$jscoverage_done("./test/vue.test.js", 2852);
            this.vms = [];
            _$jscoverage_done("./test/vue.test.js", 2856);
            if (_$jscoverage_done("./test/vue.test.js", 2856, !collection.__observer__)) {
                _$jscoverage_done("./test/vue.test.js", 2856);
                Observer.watchArray(collection, null, new Emitter);
            }
            _$jscoverage_done("./test/vue.test.js", 2857);
            collection.__observer__.on("mutate", this.mutationListener);
            _$jscoverage_done("./test/vue.test.js", 2860);
            if (_$jscoverage_done("./test/vue.test.js", 2860, collection.length)) {
                _$jscoverage_done("./test/vue.test.js", 2861);
                this.detach();
                _$jscoverage_done("./test/vue.test.js", 2862);
                for (var i = 0, l = collection.length; i < l; i++) {
                    _$jscoverage_done("./test/vue.test.js", 2863);
                    this.buildItem(collection[i], i);
                }
                _$jscoverage_done("./test/vue.test.js", 2865);
                this.retach();
            }
        },
        buildItem: function(data, index) {
            _$jscoverage_done("./test/vue.test.js", 2876);
            var node = this.el.cloneNode(true), ctn = this.container, scope = {}, ref, item;
            _$jscoverage_done("./test/vue.test.js", 2883);
            if (_$jscoverage_done("./test/vue.test.js", 2883, data)) {
                _$jscoverage_done("./test/vue.test.js", 2884);
                ref = this.vms.length > index ? this.vms[index].$el : this.ref;
                _$jscoverage_done("./test/vue.test.js", 2888);
                if (_$jscoverage_done("./test/vue.test.js", 2888, !ref.parentNode)) {
                    _$jscoverage_done("./test/vue.test.js", 2888);
                    ref = ref.vue_ref;
                }
                _$jscoverage_done("./test/vue.test.js", 2890);
                node.vue_trans = utils.attr(node, "transition", true);
                _$jscoverage_done("./test/vue.test.js", 2891);
                transition(node, 1, function() {
                    _$jscoverage_done("./test/vue.test.js", 2892);
                    ctn.insertBefore(node, ref);
                }, this.compiler);
            }
            _$jscoverage_done("./test/vue.test.js", 2897);
            scope[this.arg] = data || {};
            _$jscoverage_done("./test/vue.test.js", 2898);
            item = new this.ChildVM({
                el: node,
                scope: scope,
                compilerOptions: {
                    repeat: true,
                    repeatIndex: index,
                    repeatCollection: this.collection,
                    repeatPrefix: this.arg,
                    parentCompiler: this.compiler,
                    delegator: ctn
                }
            });
            _$jscoverage_done("./test/vue.test.js", 2911);
            if (_$jscoverage_done("./test/vue.test.js", 2911, !data)) {
                _$jscoverage_done("./test/vue.test.js", 2914);
                item.$destroy();
            } else {
                _$jscoverage_done("./test/vue.test.js", 2916);
                this.vms.splice(index, 0, item);
            }
        },
        updateIndexes: function() {
            _$jscoverage_done("./test/vue.test.js", 2924);
            var i = this.vms.length;
            _$jscoverage_done("./test/vue.test.js", 2925);
            while (i--) {
                _$jscoverage_done("./test/vue.test.js", 2926);
                this.vms[i].$index = i;
            }
        },
        detach: function() {
            _$jscoverage_done("./test/vue.test.js", 2935);
            if (_$jscoverage_done("./test/vue.test.js", 2935, this.hasTrans)) {
                _$jscoverage_done("./test/vue.test.js", 2935);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2936);
            var c = this.container, p = this.parent = c.parentNode;
            _$jscoverage_done("./test/vue.test.js", 2938);
            this.next = c.nextSibling;
            _$jscoverage_done("./test/vue.test.js", 2939);
            if (_$jscoverage_done("./test/vue.test.js", 2939, p)) {
                _$jscoverage_done("./test/vue.test.js", 2939);
                p.removeChild(c);
            }
        },
        retach: function() {
            _$jscoverage_done("./test/vue.test.js", 2943);
            if (_$jscoverage_done("./test/vue.test.js", 2943, this.hasTrans)) {
                _$jscoverage_done("./test/vue.test.js", 2943);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2944);
            var n = this.next, p = this.parent, c = this.container;
            _$jscoverage_done("./test/vue.test.js", 2947);
            if (_$jscoverage_done("./test/vue.test.js", 2947, !p)) {
                _$jscoverage_done("./test/vue.test.js", 2947);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 2948);
            if (_$jscoverage_done("./test/vue.test.js", 2948, n)) {
                _$jscoverage_done("./test/vue.test.js", 2949);
                p.insertBefore(c, n);
            } else {
                _$jscoverage_done("./test/vue.test.js", 2951);
                p.appendChild(c);
            }
        },
        unbind: function() {
            _$jscoverage_done("./test/vue.test.js", 2956);
            if (_$jscoverage_done("./test/vue.test.js", 2956, this.collection)) {
                _$jscoverage_done("./test/vue.test.js", 2957);
                this.collection.__observer__.off("mutate", this.mutationListener);
                _$jscoverage_done("./test/vue.test.js", 2958);
                var i = this.vms.length;
                _$jscoverage_done("./test/vue.test.js", 2959);
                while (i--) {
                    _$jscoverage_done("./test/vue.test.js", 2960);
                    this.vms[i].$destroy();
                }
            }
            _$jscoverage_done("./test/vue.test.js", 2963);
            var ctn = this.container, handlers = ctn.vue_dHandlers;
            _$jscoverage_done("./test/vue.test.js", 2965);
            for (var key in handlers) {
                _$jscoverage_done("./test/vue.test.js", 2966);
                ctn.removeEventListener(handlers[key].event, handlers[key]);
            }
            _$jscoverage_done("./test/vue.test.js", 2968);
            ctn.vue_dHandlers = null;
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 2972);
require.register("vue/src/directives/on.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 2973);
    var utils = require("../utils");
    function delegateCheck(el, root, identifier) {
        _$jscoverage_done("./test/vue.test.js", 2976);
        while (el && el !== root) {
            _$jscoverage_done("./test/vue.test.js", 2977);
            if (_$jscoverage_done("./test/vue.test.js", 2977, el[identifier])) {
                _$jscoverage_done("./test/vue.test.js", 2977);
                return el;
            }
            _$jscoverage_done("./test/vue.test.js", 2978);
            el = el.parentNode;
        }
    }
    _$jscoverage_done("./test/vue.test.js", 2982);
    module.exports = {
        isFn: true,
        bind: function() {
            _$jscoverage_done("./test/vue.test.js", 2987);
            if (_$jscoverage_done("./test/vue.test.js", 2987, this.compiler.repeat)) {
                _$jscoverage_done("./test/vue.test.js", 2990);
                this.el[this.expression] = true;
                _$jscoverage_done("./test/vue.test.js", 2992);
                this.el.vue_viewmodel = this.vm;
            }
        },
        update: function(handler) {
            _$jscoverage_done("./test/vue.test.js", 2997);
            this.unbind(true);
            _$jscoverage_done("./test/vue.test.js", 2998);
            if (_$jscoverage_done("./test/vue.test.js", 2998, typeof handler !== "function")) {
                _$jscoverage_done("./test/vue.test.js", 2999);
                return utils.warn('Directive "on" expects a function value.');
            }
            _$jscoverage_done("./test/vue.test.js", 3002);
            var compiler = this.compiler, event = this.arg, ownerVM = this.binding.compiler.vm;
            _$jscoverage_done("./test/vue.test.js", 3006);
            if (_$jscoverage_done("./test/vue.test.js", 3006, compiler.repeat) && _$jscoverage_done("./test/vue.test.js", 3006, !this.vm.constructor.super) && _$jscoverage_done("./test/vue.test.js", 3006, event !== "blur") && _$jscoverage_done("./test/vue.test.js", 3006, event !== "focus")) {
                _$jscoverage_done("./test/vue.test.js", 3014);
                var delegator = compiler.delegator, identifier = this.expression, dHandler = delegator.vue_dHandlers[identifier];
                _$jscoverage_done("./test/vue.test.js", 3018);
                if (_$jscoverage_done("./test/vue.test.js", 3018, dHandler)) {
                    _$jscoverage_done("./test/vue.test.js", 3018);
                    return;
                }
                _$jscoverage_done("./test/vue.test.js", 3021);
                dHandler = delegator.vue_dHandlers[identifier] = function(e) {
                    _$jscoverage_done("./test/vue.test.js", 3022);
                    var target = delegateCheck(e.target, delegator, identifier);
                    _$jscoverage_done("./test/vue.test.js", 3023);
                    if (_$jscoverage_done("./test/vue.test.js", 3023, target)) {
                        _$jscoverage_done("./test/vue.test.js", 3024);
                        e.el = target;
                        _$jscoverage_done("./test/vue.test.js", 3025);
                        e.vm = target.vue_viewmodel;
                        _$jscoverage_done("./test/vue.test.js", 3026);
                        e.item = e.vm[compiler.repeatPrefix];
                        _$jscoverage_done("./test/vue.test.js", 3027);
                        handler.call(ownerVM, e);
                    }
                };
                _$jscoverage_done("./test/vue.test.js", 3030);
                dHandler.event = event;
                _$jscoverage_done("./test/vue.test.js", 3031);
                delegator.addEventListener(event, dHandler);
            } else {
                _$jscoverage_done("./test/vue.test.js", 3036);
                var vm = this.vm;
                _$jscoverage_done("./test/vue.test.js", 3037);
                this.handler = function(e) {
                    _$jscoverage_done("./test/vue.test.js", 3038);
                    e.el = e.currentTarget;
                    _$jscoverage_done("./test/vue.test.js", 3039);
                    e.vm = vm;
                    _$jscoverage_done("./test/vue.test.js", 3040);
                    if (_$jscoverage_done("./test/vue.test.js", 3040, compiler.repeat)) {
                        _$jscoverage_done("./test/vue.test.js", 3041);
                        e.item = vm[compiler.repeatPrefix];
                    }
                    _$jscoverage_done("./test/vue.test.js", 3043);
                    handler.call(ownerVM, e);
                };
                _$jscoverage_done("./test/vue.test.js", 3045);
                this.el.addEventListener(event, this.handler);
            }
        },
        unbind: function(update) {
            _$jscoverage_done("./test/vue.test.js", 3051);
            this.el.removeEventListener(this.arg, this.handler);
            _$jscoverage_done("./test/vue.test.js", 3052);
            this.handler = null;
            _$jscoverage_done("./test/vue.test.js", 3053);
            if (_$jscoverage_done("./test/vue.test.js", 3053, !update)) {
                _$jscoverage_done("./test/vue.test.js", 3053);
                this.el.vue_viewmodel = null;
            }
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 3057);
require.register("vue/src/directives/model.js", function(exports, require, module) {
    _$jscoverage_done("./test/vue.test.js", 3058);
    var utils = require("../utils"), isIE9 = navigator.userAgent.indexOf("MSIE 9.0") > 0;
    _$jscoverage_done("./test/vue.test.js", 3061);
    module.exports = {
        bind: function() {
            _$jscoverage_done("./test/vue.test.js", 3065);
            var self = this, el = self.el, type = el.type;
            _$jscoverage_done("./test/vue.test.js", 3069);
            self.lock = false;
            _$jscoverage_done("./test/vue.test.js", 3072);
            self.event = self.compiler.options.lazy || el.tagName === "SELECT" || type === "checkbox" || type === "radio" ? "change" : "input";
            _$jscoverage_done("./test/vue.test.js", 3081);
            var attr = type === "checkbox" ? "checked" : "value";
            _$jscoverage_done("./test/vue.test.js", 3086);
            self.set = self.filters ? function() {
                _$jscoverage_done("./test/vue.test.js", 3094);
                var cursorPos;
                _$jscoverage_done("./test/vue.test.js", 3095);
                try {
                    _$jscoverage_done("./test/vue.test.js", 3096);
                    cursorPos = el.selectionStart;
                } catch (e) {}
                _$jscoverage_done("./test/vue.test.js", 3101);
                setTimeout(function() {
                    _$jscoverage_done("./test/vue.test.js", 3102);
                    self.vm.$set(self.key, el[attr]);
                    _$jscoverage_done("./test/vue.test.js", 3103);
                    if (_$jscoverage_done("./test/vue.test.js", 3103, cursorPos !== undefined)) {
                        _$jscoverage_done("./test/vue.test.js", 3104);
                        el.setSelectionRange(cursorPos, cursorPos);
                    }
                }, 0);
            } : function() {
                _$jscoverage_done("./test/vue.test.js", 3110);
                self.lock = true;
                _$jscoverage_done("./test/vue.test.js", 3111);
                self.vm.$set(self.key, el[attr]);
                _$jscoverage_done("./test/vue.test.js", 3112);
                self.lock = false;
            };
            _$jscoverage_done("./test/vue.test.js", 3114);
            el.addEventListener(self.event, self.set);
            _$jscoverage_done("./test/vue.test.js", 3118);
            if (_$jscoverage_done("./test/vue.test.js", 3118, isIE9)) {
                _$jscoverage_done("./test/vue.test.js", 3119);
                self.onCut = function() {
                    _$jscoverage_done("./test/vue.test.js", 3121);
                    setTimeout(function() {
                        _$jscoverage_done("./test/vue.test.js", 3122);
                        self.set();
                    }, 0);
                };
                _$jscoverage_done("./test/vue.test.js", 3125);
                self.onDel = function(e) {
                    _$jscoverage_done("./test/vue.test.js", 3126);
                    if (_$jscoverage_done("./test/vue.test.js", 3126, e.keyCode === 46) || _$jscoverage_done("./test/vue.test.js", 3126, e.keyCode === 8)) {
                        _$jscoverage_done("./test/vue.test.js", 3127);
                        self.set();
                    }
                };
                _$jscoverage_done("./test/vue.test.js", 3130);
                el.addEventListener("cut", self.onCut);
                _$jscoverage_done("./test/vue.test.js", 3131);
                el.addEventListener("keyup", self.onDel);
            }
        },
        update: function(value) {
            _$jscoverage_done("./test/vue.test.js", 3136);
            if (_$jscoverage_done("./test/vue.test.js", 3136, this.lock)) {
                _$jscoverage_done("./test/vue.test.js", 3136);
                return;
            }
            _$jscoverage_done("./test/vue.test.js", 3138);
            var self = this, el = self.el;
            _$jscoverage_done("./test/vue.test.js", 3140);
            if (_$jscoverage_done("./test/vue.test.js", 3140, el.tagName === "SELECT")) {
                _$jscoverage_done("./test/vue.test.js", 3142);
                var o = el.options, i = o.length, index = -1;
                _$jscoverage_done("./test/vue.test.js", 3145);
                while (i--) {
                    _$jscoverage_done("./test/vue.test.js", 3146);
                    if (_$jscoverage_done("./test/vue.test.js", 3146, o[i].value == value)) {
                        _$jscoverage_done("./test/vue.test.js", 3147);
                        index = i;
                        _$jscoverage_done("./test/vue.test.js", 3148);
                        break;
                    }
                }
                _$jscoverage_done("./test/vue.test.js", 3151);
                o.selectedIndex = index;
            } else {
                _$jscoverage_done("./test/vue.test.js", 3152);
                if (_$jscoverage_done("./test/vue.test.js", 3152, el.type === "radio")) {
                    _$jscoverage_done("./test/vue.test.js", 3153);
                    el.checked = value == el.value;
                } else {
                    _$jscoverage_done("./test/vue.test.js", 3154);
                    if (_$jscoverage_done("./test/vue.test.js", 3154, el.type === "checkbox")) {
                        _$jscoverage_done("./test/vue.test.js", 3155);
                        el.checked = !!value;
                    } else {
                        _$jscoverage_done("./test/vue.test.js", 3157);
                        el.value = utils.toText(value);
                    }
                }
            }
        },
        unbind: function() {
            _$jscoverage_done("./test/vue.test.js", 3162);
            this.el.removeEventListener(this.event, this.set);
            _$jscoverage_done("./test/vue.test.js", 3163);
            if (_$jscoverage_done("./test/vue.test.js", 3163, isIE9)) {
                _$jscoverage_done("./test/vue.test.js", 3164);
                this.el.removeEventListener("cut", this.onCut);
                _$jscoverage_done("./test/vue.test.js", 3165);
                this.el.removeEventListener("keyup", this.onDel);
            }
        }
    };
});

_$jscoverage_done("./test/vue.test.js", 3170);
require.alias("component-emitter/index.js", "vue/deps/emitter/index.js");

_$jscoverage_done("./test/vue.test.js", 3171);
require.alias("component-emitter/index.js", "emitter/index.js");

_$jscoverage_done("./test/vue.test.js", 3172);
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

_$jscoverage_done("./test/vue.test.js", 3174);
require.alias("vue/src/main.js", "vue/index.js");