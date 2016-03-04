/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			// Todo Set up listener on the Store with the callback storeCallback.
			//this.todos = util.store('todos-jquery');
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		storeCallback: function () {
			// Todo Add code to render the application over again when the store has changed
		},
		bindEvents: function () {
			$('#new-todo').on('keyup', this.create.bind(this));
			$('#toggle-all').on('change', this.toggleAll.bind(this));
			$('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			$('#todo-list')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.edit.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var todos = this.getFilteredTodos();
			$('#todo-list').html(this.todoTemplate(todos));
			$('#main').toggle(todos.length > 0);
			$('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			$('#new-todo').focus();
			// We won't persist the list between refreshes
			//util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			// Todo get this from the Store
			//var todoCount = this.todos.length;
			// Todo get this from the Store
			//var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('#footer').toggle(todoCount > 0).html(template);
		},
		toggleAll: function (e) {
			var isChecked = $(e.target).prop('checked');

			// Todo Move the state into the Store
			// Todo Move the rendering logic into the Store callback

			//this.todos.forEach(function (todo) {
			//	todo.completed = isChecked;
			//});
            //
			//this.render();
		},
		// Todo move this functions into the Store
		//getActiveTodos: function () {
		//	return this.todos.filter(function (todo) {
		//		return !todo.completed;
		//	});
		//},
		// Todo move this functions into the Store
		//getCompletedTodos: function () {
		//	return this.todos.filter(function (todo) {
		//		return todo.completed;
		//	});
		//},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				// Todo Get this information from the Store
				//return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				// Todo Get this information from the Store
				//return this.getCompletedTodos();
			}

			// Todo Get this information from the Store
			//return this.todos;
		},
		destroyCompleted: function () {
			// Todo Create an action for this, and handle it in the Store to change the state.
			//this.todos = this.getActiveTodos();
			this.filter = 'all';
			// Todo Move the rendering logic into the Store callback
			//this.render();
		},
		// This can stay here, but it fits best in the Store.
		// Todo move this into the Store. You can replace it with a method to retrieve the id instead.
		indexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			// Todo get this from the Store
			//var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			// Todo Create an action for this, and handle it in the Store to change the state.
			//this.todos.push({
			//	id: util.uuid(),
			//	title: val,
			//	completed: false
			//});

			$input.val('');

			// Todo Move the rendering logic into the Store callback
			//this.render();
		},
		toggle: function (e) {
			// Todo get id from a new method instead of the index from this old one.
			//var i = this.indexFromEl(e.target);

			// Todo Create an action for this, and handle it in the Store to change the state.
			//this.todos[i].completed = !this.todos[i].completed;

			// Todo Move the rendering logic into the Store callback
			//this.render();
		},
		edit: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			$input.val($input.val()).focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if (!val) {
				this.destroy(e);
				return;
			}

			if ($el.data('abort')) {
				$el.data('abort', false);
			} else {
				// Todo Create an action for this, and handle it in the Store to change the state.
				//this.todos[this.indexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			// Todo Create an action for this, and handle it in the Store to change the state.
			//this.todos.splice(this.indexFromEl(e.target), 1);

			// Todo Move the rendering logic into the Store callback
			//this.render();
		}
	};

	var Constants = {
		CREATE: 'CREATE',
		UPDATE: 'UPDATE',
		DESTROY: 'DESTROY',
		TOGGLE: 'TOGGLE',
		TOGGLE_ALL: 'TOGGLE_ALL',
		DESTROY_COMPLETED: 'DESTROY_COMPLETED'
	};

	var Store = function () {

		var observerCallbacks = [];

		function emitChange() {
			observerCallbacks.forEach(function (observerCallback) {
				observerCallback();
			})
		}

		return {
			addChangeListener: function (observerCallback) {
				observerCallbacks.push(observerCallback);
			},

			performAction: function (action) {
				console.log(action);
				switch (action.actionType) {
					case (Constants.CREATE):
						break;
					case (Constants.UPDATE):
						break;
					case (Constants.DESTROY):
						break;
					case (Constants.TOGGLE):
						break;
					case (Constants.TOGGLE_ALL):
						break;
					case (Constants.DESTROY_COMPLETED):
						break;
					default:
						return;
				}
				emitChange();
			}
		};
	}();

	var Actions = {
		create: function (text) {
			Store.performAction({
				actionType: Constants.CREATE,
				text: text
			})
		}
	};

	App.init();
});
