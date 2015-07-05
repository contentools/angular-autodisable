angular.module('angular-autodisable', []);
/* global angular */
(function(module) {
	'use strict';

	/**
	 * @directive [autodisable]
	 * @example
	 * 		<form autodisable ng-submit="page.save()">
	 * 			<input type="text" autodisable />
	 * 			<button type="submit" autodisable ng-click="page.save()">Save</button>
	 * 		</form>
	 */
	function autodisableDirective(AutoDisable) {
		return {
			restrict: 'A',
			compile: compiler,
			require: ['?form', '?^form']
		};

		function compiler(element, attrs) {
			var autoDisable = new AutoDisable(element, attrs);
			return autoDisable.link.bind(autoDisable);
		}
	}

	module.directive('autodisable', autodisableDirective);

})(angular.module('angular-autodisable'));

/* global angular */
(function(module) {
	'use strict';

	var TAG_INPUT = /^(input|textarea)$/i,
		TAG_BUTTON = /^button$/i,
		TAG_FORM = /^form$/i,

		CLS_LOCKED = 'autodisable-locked',
		CLS_UNLOCKED = 'autodisable-unlocked';

	/**
	 * @factory
	 */
	function AutoDisableFactory($parse) {
		/* jshint validthis: true */
		function AutoDisable(element, attrs) {
			var tagName = String(element && element[0] && element[0].tagName || ''),
				type = attrs.type || '',
				isSubmit = type === 'submit',
				isInput = TAG_INPUT.test(tagName),
				isButton = TAG_BUTTON.test(tagName),
				isForm = TAG_FORM.test(tagName);

			this.type = type;

			this.isButton = isSubmit && (isButton || isInput);
			this.isForm = isForm;
			this.isInput = !isButton && !isForm;

			this.onClick = attrs.ngClick || null;
			this.onSubmit = attrs.ngSubmit || null;
		}

		function link($scope, $element, $attrs, controllers) {
			this.context = {
				scope: $scope,
				element: $element,
				attrs: $attrs,
				form: controllers[0],
				parentForm: controllers[1]
			};

			this.initialize();
		}

		function lock() {
			var context = this.context;

			if (context.locked) return;

			context.locked = true;
			context.element.addClass(CLS_LOCKED).removeClass(CLS_UNLOCKED);

			if (this.isForm) {
				context.form.$locked = true;
			} else {
				context.attrs.$set('disabled', true);
			}
		}

		function unlock() {
			var context = this.context;

			if (!context.locked) return;

			context.locked = false;
			context.element.addClass(CLS_UNLOCKED).removeClass(CLS_LOCKED);

			if (this.isForm) {
				context.form.$locked = false;
			} else {
				context.attrs.$set('disabled', false);
			}
		}

		function initialize() {
			if (this.isForm && this.onSubmit) {
				bindEvent(this, 'submit');
				bindFormState(this);
				return;
			}

			if (this.isButton && this.onClick) {
				bindEvent(this, 'click');
				bindChildState(this);
				return;
			}

			bindChildState(this);
		}

		AutoDisable.prototype = {
			constructor: AutoDisable,
			link: link,
			lock: lock,
			unlock: unlock,
			initialize: initialize
		};

		// helper functions
		function bindEvent(self, eventName) {
			var attributeName = 'ng' + eventName.charAt(0).toUpperCase() + eventName.slice(1),
				ctx = self.context,
				fn = $parse(ctx.attrs[attributeName], /* interceptorFn */ null, /* expensiveChecks */ true);

			ctx.element.unbind(eventName).bind(eventName, handler);

			function handler($event) {
				if (ctx.locked) return;

				var result = fn(ctx.scope, {
					$event: $event
				});

				if (isPromise(result)) {
					self.lock();

					result.finally(function() {
						self.unlock();
					});
				}

				ctx.scope.$apply();
			}
		}

		function bindFormState(self) {
			var ctx = self.context,
				form = ctx.form || false;

			if (!form) return;

			ctx.scope.$watch(isInvalid, updateLock);

			function isInvalid() {
				return Boolean(form.$pristine || form.$invalid);
			}

			function updateLock(invalid) {
				if (invalid) {
					self.lock();
				} else {
					self.unlock();
				}
			}
		}

		function bindChildState(self) {
			var ctx = self.context,
				form = ctx.parentForm || false;

			if (!form) return;

			ctx.scope.$watch(isInvalid, updateLock);

			function isInvalid() {
				return Boolean(form.$locked);
			}

			function updateLock(locked) {
				if (locked) {
					self.lock();
				} else {
					self.unlock();
				}
			}
		}

		function isPromise(value) {
			return Boolean(value && typeof value.then === 'function' &&
				typeof value.finally === 'function');
		}

		return AutoDisable;
	}

	module.factory('AutoDisable', AutoDisableFactory);

})(angular.module('angular-autodisable'));
