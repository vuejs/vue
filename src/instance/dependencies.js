var _ = require('../util')

/**
 * Look up the service and transform it by setter.
 *
 * @param {String} name
 * @param {Object} services
 * @param {Vue} vm
 * @returns {*}
 */
function lookupService (name, services, vm) {
	if (!services || !services[name]) {
		_.warn(
			'required service `' + name + '` was not specified in `' + vm.constructor.name + '`.'
		)
		return
	}
	return services[name]
}

/**
 * Initialize the dependencies.
 */
exports._initDependencies = function () {
	if (this.$options.dependencies) {
		var dependencies = this.$options.dependencies
		var services = this.$options.services
		var $services = this.$services = {}
		for (var i = 0, l = dependencies.length; i < l; ++i) {
			var dep = dependencies[i]
			$services[dep] = lookupService(dep, services, this)
		}
	}
}