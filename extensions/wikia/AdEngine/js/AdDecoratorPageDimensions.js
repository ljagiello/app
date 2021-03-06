/*exported AdDecoratorPageDimensions*/
var AdDecoratorPageDimensions = function (adLogicPageDimensions, log) {
	'use strict';

	var logGroup = 'ext.wikia.adengine.decorator.shortpage';

	/**
	 * fillInSlot decorator. Returns function to call instead.
	 *
	 * @returns {function}
	 */
	function decorator(fillInSlot) {
		log(['decorator', fillInSlot], 'debug', logGroup);

		return function (slot) {
			log(['decorated', slot], 'debug', logGroup);

			var slotname = slot[0];

			if (adLogicPageDimensions.isApplicable(slotname)) {
				adLogicPageDimensions.addSlot(slotname, function () {
					fillInSlot(slot);
				});

				log(['decorated', slot, 'deferred'], 'debug', logGroup);
				return function () {};
			}

			log(['decorated', slot, 'return same'], 'debug', logGroup);
			return fillInSlot(slot);
		};
	}

	return decorator;
};
