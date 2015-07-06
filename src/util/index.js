var lang = require('./lang')
var extend = lang.extend

extend(exports, lang)
extend(exports, require('./env'))
extend(exports, require('./dom'))
extend(exports, require('./options'))
extend(exports, require('./component'))
extend(exports, require('./debug'))
