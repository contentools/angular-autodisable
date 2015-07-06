/* global angular */
(function(module) {
	'use strict';

	var TAG_INPUT = /^(input|textarea)$/i,
		TAG_BUTTON = /^button$/i,
		TAG_FORM = /^form$/i,

		CLS_AUTODISABLE = 'autodisable',
		CLS_LOCKED = 'autodisable-locked',
		CLS_BUSY = 'autodisable-busy',
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

			this.onClick = !!attrs.ngClick;
			this.onSubmit = !!attrs.ngSubmit;
		}

		AutoDisable.prototype = {
			constructor: AutoDisable,
			link: link,
			lock: lock,
			unlock: unlock,
			busy: busy,
			initialize: initialize
		};

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

		function link($scope, $element, $attrs, controllers) {
			var form = this.isForm ? controllers[0] : controllers[1];
			form.$busy = form.$locked = false;

			this.context = {
				scope: $scope,
				element: $element,
				attrs: $attrs,
				form: form
			};

			$element.addClass(CLS_AUTODISABLE);

			this.initialize();
		}

		function busy(promise) {
			var context = this.context,
				self = this;

			if (context.promise) return;

			self.lock();
			context.element.addClass(CLS_BUSY);

			if (self.isForm) {
				context.form.$busy = true;
			}

			if (promise) {
				context.promise = promise.finally(function() {
					self.unlock();
					context.element.removeClass(CLS_BUSY);
					context.promise = null;

					if (self.isForm) {
						context.form.$busy = false;
					}
				});
			}
		}

		function lock() {
			var context = this.context;

			if (context.locked) return;

			context.locked = true;
			context.element.addClass(CLS_LOCKED).removeClass(CLS_UNLOCKED);

			if (this.isForm) {
				context.form.$locked = true;
			} else if (this.isButton || context.form.$busy) {
				context.attrs.$set('disabled', true);
			}
		}

		function unlock() {
			var context = this.context;

			if (!context.locked) return;

			context.locked = false;
			context.element
				.addClass(CLS_UNLOCKED)
				.removeClass(CLS_LOCKED)
				.removeClass(CLS_BUSY);

			if (this.isForm) {
				context.form.$locked = false;
			} else {
				context.attrs.$set('disabled', false);
			}
		}

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
					self.busy(result);
				}

				ctx.scope.$apply();
			}
		}

		function bindStateTrigger(self, watcher, trigger) {
			var ctx = self.context,
				form = ctx.form || false;

			if (!form) return;

			ctx.scope.$watch(watcher, trigger);
		}

		function bindFormState(self) {
			var form = self.context.form;
			bindStateTrigger(self, isInvalid, updateLockOnForm);

			function isInvalid() {
				return Boolean(form.$pristine || form.$invalid);
			}

			function updateLockOnForm(invalid) {
				if (invalid) {
					self.lock();
				} else {
					self.unlock();
				}
			}
		}

		function bindChildState(self) {
			var form = self.context.form;
			bindStateTrigger(self, isFormLocked, updateChildLock);

			function isFormLocked() {
				return Number(form.$locked) + Number(form.$busy);
			}

			function updateChildLock() {
				if (form.$busy) {
					return self.busy();
				}

				if (form.$locked) {
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

	module.factory('AutoDisable', ['$parse', AutoDisableFactory]);

})(angular.module('angular-autodisable'));
