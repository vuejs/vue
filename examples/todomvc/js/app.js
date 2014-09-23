/*global Vue, todoStorage */

(function (exports) {

    'use strict';

    exports.app = new Vue({

        // the root element that will be compiled
        el: '#todoapp',

        // app state data
        data: {
            todos: todoStorage.fetch(),
            newTodo: '',
            editedTodo: null,
            activeFilter: 'all',
            filters: {
                all: function () {
                    return true;
                },
                active: function (todo) {
                    return !todo.completed;
                },
                completed: function (todo) {
                    return todo.completed;
                }
            }
        },

        // ready hook, watch todos change for data persistence
        ready: function () {
            this.$watch('todos', function (todos) {
                todoStorage.save(todos);
            }, true);
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

        // a custom filter that filters the displayed todos array
        filters: {
            filterTodos: function (todos) {
                return todos.filter(this.filters[this.activeFilter]);
            }
        },

        // computed properties
        // http://vuejs.org/guide/computed.html
        computed: {
            remaining: function () {
                return this.todos.filter(this.filters.active).length;
            },
            allDone: {
                get: function () {
                    return this.remaining === 0;
                },
                set: function (value) {
                    this.todos.forEach(function (todo) {
                        todo.completed = value;
                    });
                }
            }
        },

        // methods that implement data logic.
        // note there's no DOM manipulation here at all.
        methods: {

            addTodo: function () {
                var value = this.newTodo && this.newTodo.trim();
                if (!value) {
                    return;
                }
                this.todos.push({ title: value, completed: false });
                this.newTodo = '';
            },

            removeTodo: function (todo) {
                this.todos.$remove(todo.$data);
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
            },

            cancelEdit: function (todo) {
                this.editedTodo = null;
                todo.title = this.beforeEditCache;
            },
            
            removeCompleted: function () {
                this.todos = this.todos.filter(this.filters.active);
            }
        }
    });

})(window);