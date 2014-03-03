var prefix = 'v',
    specialAttributes = [
        'pre',
        'ref',
        'with',
        'text',
        'repeat',
        'partial',
        'component',
        'animation',
        'transition',
        'effect'
    ],
    config = module.exports = {

        debug          : false,
        silent         : false,
        enterClass     : 'v-enter',
        leaveClass     : 'v-leave',
        interpolate    : true,
        customTags     : false,
        attrs          : {},

        get prefix () {
            return prefix
        },
        set prefix (val) {
            prefix = val
            updatePrefix()
        }
        
    }

function updatePrefix () {
    specialAttributes.forEach(function (attr) {
        config.attrs[attr] = prefix + '-' + attr
    })
}

updatePrefix()