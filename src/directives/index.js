var directives = module.exports = Object.create(null)

// manipulation directives
directives.text       = require('./text')
directives.html       = require('./html')
directives.attr       = require('./attr')
directives.show       = require('./show')
directives['class']   = require('./class')
directives.ref        = require('./ref')
directives.cloak      = require('./cloak')
directives.style      = require('./style')
directives.partial    = require('./partial')
directives.transition = require('./transition')

// event listener directives
directives.on         = require('./on')
directives.model      = require('./model')

// child vm directives
directives.component  = require('./component')
directives.repeat     = require('./repeat')
directives['if']      = require('./if')
directives['with']    = require('./with')