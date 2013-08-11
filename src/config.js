module.exports = {

    prefix      : 'sd',
    debug       : false,
    datum       : {},
    controllers : {},

    interpolateTags : {
        open  : '{{',
        close : '}}'
    },

    log: function (msg) {
        if (this.debug) console.log(msg)
    },
    
    warn: function(msg) {
        if (this.debug) console.warn(msg)
    }
}