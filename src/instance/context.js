var _ = require('../util')

/**
 * Initialize the context.
 */
exports._initContext = function () {
	if (this.$options.getChildContext) {
		this.getChildContext = _.bind(this.$options.getChildContext, this)
	}

	if (this.$options.context) {
		var context = this.$options.context
		if (!this.$parent) {
			_.warn(
				'required parent vm was not specified when initializing context in `' +
				this.constructor.name + '`.'
			)
			return
		}

		var childContext = this.$parent.getChildContext() || {}
		var $context = this.$context = {}
		for (var i = 0, l = context.length; i < l; ++i) {
			var name = context[i]
			var fn = childContext[name]
			if (typeof fn !== 'function') {
				_.warn(
					'required type function for context `' + name + '` in `' +
					this.constructor.name + '`.'
				)
				continue
			}
			$context[name] = fn
		}
	}
}

/**
 * The default behavior to get child context.
 *
 */
exports.getChildContext = function () { }