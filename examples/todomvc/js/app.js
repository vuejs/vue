/*global Vue, todoStorage */

(function (exports) {

    'use strict';

    exports.app = new Vue({

        // the root element that will be compiled
        el: '#todoapp',

        // data
        data: {
            todos: todoStorage.fetch(),
            newTodo: '',
            editedTodo: null
        },

        // a custom directive to wait for the DOM to be updated
        // before focusing on the input field.
        // http://vuejs.org/guide/directives.html#Writing_a_Custom_Directive
        directives: {
            'todo-focus': function (value) {
                if (!value) {
                    return;
                }
                var el = this.el;
                setTimeout(function () {
                    el.focus();
                }, 0);
            }
        },

        // the `created` lifecycle hook.
        // this is where we do the initialization work.
        // http://vuejs.org/api/instantiation-options.html#created
        created: function () {
            // setup filters
            this.filters = {
                all: function (todo) {
                    // collect dependency.
                    // http://vuejs.org/guide/computed.html#Dependency_Collection_Gotcha
                    /* jshint expr:true */
                    todo.completed;
                    return true;
                },
                active: function (todo) {
                    return !todo.completed;
                },
                completed: function (todo) {
                    return todo.completed;
                }
            };
            // default filter
            this.setFilter('all');
        },

        // computed property
        // http://vuejs.org/guide/computed.html
        computed: {
            remaining: function () {
                return this.todos.filter(this.filters.active).length
            },
            allDone: {
                $get: function () {
                    return this.remaining === 0;
                },
                $set: function (value) {
                    this.todos.forEach(function (todo) {
                        todo.completed = value;
                    });
                    todoStorage.save();
                }
            }
        },

        // methods that implement data logic.
        // note there's no DOM manipulation here at all.
        methods: {

            setFilter: function (filter) {
                this.filter = filter;
                this.filterTodo = this.filters[filter];
            },

            addTodo: function () {
                var value = this.newTodo && this.newTodo.trim();
                if (!value) {
                    return;
                }
                this.todos.push({ title: value, completed: false });
                this.newTodo = '';
                todoStorage.save();
            },

            removeTodo: function (todo) {
                this.todos.$remove(todo.$data);
                todoStorage.save();
            },

            toggleTodo: function (todo) {
                todoStorage.save();
            },

            editTodo: function (todo) {
                this.beforeEditCache = todo.title;
                this.editedTodo = todo;
            },

            doneEdit: function (todo) {
                if (!this.editedTodo) {
                    return;
                }
                this.editedTodo = null;
                todo.title = todo.title.trim();
                if (!todo.title) {
                    this.removeTodo(todo);
                }
                todoStorage.save();
            },

            cancelEdit: function (todo) {
                this.editedTodo = null;
                todo.title = this.beforeEditCache;
            },
            
            removeCompleted: function () {
                this.todos.$remove(function (todo) {
                    return todo.completed;
                });
                todoStorage.save();
            }
        }
    });

})(window);