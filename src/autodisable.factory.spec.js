'use strict';

describe('AutoDisable factory', function() {

	beforeEach(module('angular-autodisable'));

	var instance, makeInstance;

	beforeEach(inject(function (AutoDisable) {
		makeInstance = function (el, attrs) {
			instance = new AutoDisable(el, attrs);
		};
	}));

	describe('#constructor(tElement, tAttrs): initialize the instance based on values of compile phase (element and attrs)', function() {
		it('should initialize a form element', inject(function () {
			// var element = {};
			// makeInstance(element, attrs)
		}));
	});
});

