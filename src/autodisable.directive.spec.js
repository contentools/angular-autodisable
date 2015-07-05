'use strict';

describe('autodisable directive', function() {

	beforeEach(module('angular-autodisable'));

	var compile, flush;

	beforeEach(inject(function ($rootScope, $compile) {
		compile = function (template) {
			var el = $compile(template)($rootScope);
			$rootScope.$digest();

			return el;
		};

		flush = function () {
			$rootScope.$digest();
		};
	}));

	describe('disable form submission if there is a promise waiting in the submit event handler', function() {
		it('should not fire the handler twice while the promise is waiting', inject(function ($rootScope, $q) {
			var template = '<form autodisable ng-submit="onsubmit()"></form>',
				element = compile(template),
				deferred = $q.defer(),
				count = 0,
				form = element.data('$formController');

			form.$setDirty();
			flush();

			$rootScope.onsubmit = function () {
				count++;
				return deferred.promise;
			};

			element.triggerHandler('submit');
			expect(count).toBe(1);

			element.triggerHandler('submit');
			expect(count).toBe(1);

			deferred.resolve();
			flush();

			element.triggerHandler('submit');
			expect(count).toBe(2);
		}));

		it('should autolock if the form is invalid or pristine', inject(function ($rootScope) {
			var template = '<form autodisable ng-submit="onsubmit()"></form>',
				element = compile(template),
				count = 0;

			$rootScope.onsubmit = function () {
				count++;
			};

			element.triggerHandler('submit');
			expect(count).toBe(0);
		}));

		it('should lock the child nodes when the parent is locked', inject(function () {
			var template = '<form autodisable ng-submit="onsubmit()">'+
				'<input type="text" autodisable ng-model="foo" />'+
				'<button type="submit" autodisable>OK</button>'+
				'</form>',

				element = compile(template);

			// auto locked due to form state being pristine
			expect(element.find('button').attr('disabled')).toBe('disabled');
			expect(element.find('input').attr('disabled')).toBe('disabled');
		}));

		it('should unlock the child nodes when the parent is unlocked', inject(function () {
			var template = '<form autodisable ng-submit="onsubmit()">'+
				'<input type="text" autodisable ng-model="foo" />'+
				'<button type="submit" autodisable>OK</button>'+
				'</form>',

				element = compile(template),
				form = element.data('$formController');

			form.$setDirty();
			flush();

			expect(element.find('button').attr('disabled')).not.toBe('disabled');
			expect(element.find('input').attr('disabled')).not.toBe('disabled');
		}));
	});
});