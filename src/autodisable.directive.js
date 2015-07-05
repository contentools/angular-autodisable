/* global angular */
(function(module) {
	'use strict';

	var CLS_LOCKED = 'autodisable-locked',
		CLS_UNLOCKED = 'autodisable-unlocked'

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

})(angular.module('angular-autodisable', []));