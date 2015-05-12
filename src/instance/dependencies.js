var _ = require('../util')

/**
 * Look up the service and transform it by setter.
 *
 * @param {String} name
 * @param {Function} set
 * @param {Object} services
 * @param {Vue} vm
 * @returns {*}
 */
function lookupService (name, set, services, vm) {
	if (!services || !services[name]) {
		_.warn(
			'cannot find service "' + name + '" which is required by "' + vm.$options.name + '".'
		)
		return
	}
	return set.call(vm, services[name], name)
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
			$services[dep.name] = lookupService(dep.name, dep.set, services, this)
		}
	}
}