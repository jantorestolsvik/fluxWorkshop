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
			Store.addChangeListener(this.storeCallback.bind(this));
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
			this.render();
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
			$('#toggle-all').prop('checked', Store.getActiveTodos().length === 0);
			this.renderFooter();
			$('#new-todo').focus();
		},
		renderFooter: function () {
			// Todo get this from the Store
			var todoCount = Store.getTodos().length;
			// Todo get this from the Store
			var activeTodoCount = Store.getActiveTodos().length;
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

			Actions.toggleAll(isChecked);
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				// Todo Get this information from the Store
				return Store.getActiveTodos();
			}

			if (this.filter === 'completed') {
				// Todo Get this information from the Store
				return Store.getCompletedTodos();
			}

			// Todo Get this information from the Store
			return Store.getTodos();
		},
		destroyCompleted: function () {
			this.filter = 'all';
			// Todo Create an action for this, and handle it in the Store to change the state.
			Actions.destroyCompleted();
			// Todo Move the rendering logic into the Store callback
		},
		// Todo move this into the Store. You can replace it with a method to retrieve the id instead.
		idFromEvent: function (el) {
			return $(el.target).closest('li').data('id');
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			// Todo Create an action for this, and handle it in the Store to change the state.
			Actions.create(val);

			$input.val('');

			// Todo Move the rendering logic into the Store callback
		},
		toggle: function (e) {
			// Todo get id from a new method instead of the index from this old one.
			// Todo Create an action for this, and handle it in the Store to change the state.
			Actions.toggle(this.idFromEvent(e));
			// Todo Move the rendering logic into the Store callback
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
				this.render();
			} else {
				// Todo Create an action for this, and handle it in the Store to change the state.
				Actions.update(this.idFromEvent(e), val);
			}
		},
		destroy: function (e) {
			// Todo Create an action for this, and handle it in the Store to change the state.
			Actions.destroy(this.idFromEvent(e));
			// Todo Move the rendering logic into the Store callback
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
		var todos = [];
		var observerCallbacks = [];

		function emitChange() {
			observerCallbacks.forEach(function (observerCallback) {
				observerCallback();
			})
		}

		function findIndex(id) {
			var i = todos.length;
			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
			return false;
		}

		return {
			addChangeListener: function (observerCallback) {
				observerCallbacks.push(observerCallback);
			},

			getTodos: function () {
				return todos;
			},

			getActiveTodos: function () {
				return todos.filter(function (todo) {
					return !todo.completed;
				});
			},

			getCompletedTodos: function () {
				return todos.filter(function (todo) {
					return todo.completed;
				});
			},

			performAction: function (action) {
				console.log(action);
				switch (action.actionType) {
					case (Constants.CREATE):
						todos.push({
							id: util.uuid(),
							title: action.text,
							completed: false
						});
						break;
					case (Constants.UPDATE):
						var i = findIndex(action.id);
						if (i !== false) {
							todos[i].title = action.text;
						}
						break;
					case (Constants.DESTROY):
						var i = findIndex(action.id);
						if (i !== false) {
							todos.splice(i,1);
						}
						break;
					case (Constants.TOGGLE):
						var i = findIndex(action.id);
						if (i !== false) {
							todos[i].completed = !todos[i].completed;
						}
						break;
					case (Constants.TOGGLE_ALL):
						todos.forEach(function (todo) {
							todo.completed = action.isChecked;
						});
						break;
					case (Constants.DESTROY_COMPLETED):
						todos = todos.filter(function (todo) {
							return !todo.completed;
						});
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
		},
		update: function (id, text) {
			Store.performAction({
				actionType: Constants.UPDATE,
				id: id,
				text: text
			})
		},
		destroy: function (id) {
			Store.performAction({
				actionType: Constants.DESTROY,
				id: id
			})
		},
		toggle: function (id) {
			Store.performAction({
				actionType: Constants.TOGGLE,
				id: id
			})
		},
		toggleAll: function (isChecked) {
			Store.performAction({
				actionType: Constants.TOGGLE_ALL,
				isChecked: isChecked
			})
		},
		destroyCompleted: function () {
			Store.performAction({
				actionType: Constants.DESTROY_COMPLETED
			})
		}
	};

	App.init();

	$('#test').on('click', function (e) {
		Actions.create("test :)");
	})
});

