/** Add a toJSON method if the object's prototype doesn't have one
  * @param object o
  */
function extendPrototypeToJSON(o) {
	// http://stackoverflow.com/a/18391400/2652567
	if (!('toJSON' in o.prototype)) {
		Object.defineProperty(o.prototype, 'toJSON', {
			value: function () {
				var alt = {};

				Object.getOwnPropertyNames(this).forEach(function (key) {
					alt[key] = this[key];
				}, this);

				return alt;
			},
			configurable: true,
			writable: true
		});
	}
}

// This is useful in serializing errors to the Log
extendPrototypeToJSON(Error);
extendPrototypeToJSON(Meteor.Error);
