/*jshint unused:false */

(function (exports) {

	'use strict';

	var STORAGE_KEY = 'todos-vuejs-2.0';

	exports.todoStorage = {
		fetch: function () {
			var todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
			todos.forEach(function (todo, index) {
			  todo.id = index
			});
			exports.todoStorage.uid = todos.length;
			return todos;
		},
		save: function (todos) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		}
	};

})(window);
