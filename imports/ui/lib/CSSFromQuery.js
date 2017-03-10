export default CSSFromQuery = function() {
	var self = [];
	var customizableProperties = [];

	/** Add a customizable Property
	  *
	  * @param {String} key      - key to use in the URL
	  * @param {String} name     - name of the css-property to change
	  * @param {String} selector - html selector of which the css should change
	  */
	customizableProperties.add = function(key, name, selector) {
		this.push({
			key: key,
			name: name,
			selector: selector
		});
		return this;
	};

	// define a default set of customizable properties
	customizableProperties
		.add('bgcolor', 'background-color', 'body')
		.add('color', 'color', 'body')
		.add('eventbg', 'background-color', '.list-style-item')
		.add('eventcolor', 'color', '.list-style-item')
		.add('linkcolor', 'color', '.list-style-item a')
		.add('fontsize', 'font-size', '*');

	/** Invoke the add method on customizableProperties
	  *
	  * @param {String} key      - key to use in the URL
	  * @param {String} name     - name of the css-property to change
	  * @param {String} selector - html selector of which the css should change
	  */
	self.add = function(key, name, selector) {
		customizableProperties.add(key, name, selector);
		return self;
	};

	/** Read, check and add the given properties, then add them to the set of rules
	  *
	  * @param {Object} query - Query paramaters of route
	  */
	self.read = function(query) {
		_.forEach(customizableProperties, function(property) {
			var queryValue = query[property.key];
			var cssValue;
			if (typeof queryValue !== 'undefined') {
				// hexify color values
				if (property.name.indexOf('color') >= 0) {
					if (queryValue.match(/^[0-9A-F]+$/i)) {
						cssValue = '#' + queryValue.substr(0, 6);
					}
				} else {
					var intVal = parseInt(queryValue, 10);
					if (!Number.isNaN(intVal)) {
						cssValue = Math.max(0, Math.min(1000, intVal)) + 'px';
					}
				}

				if (cssValue) {
					self.push({
						selector: property.selector,
						name: property.name,
						value: cssValue
					});
				}
			}
		});
	};

	return self;
};
