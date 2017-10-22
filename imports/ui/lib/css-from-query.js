export const CssFromQuery = () => {
	const self = [];
	const customizableProperties = [];

	/** Add a customizable Property
	  *
	  * @param {String} key      - key to use in the URL
	  * @param {String} name     - name of the css-property to change
	  * @param {String} selector - html selector of which the css should change
	  */
	customizableProperties.add = function(key, name, selector) {
		this.push({ key, name, selector });
		return this;
	};

	// define a default set of customizable properties
	customizableProperties
		.add('bgcolor', 'background-color', 'body')
		.add('color', 'color', 'body')
		.add('itembg', 'background-color', '.frame-list-item')
		.add('itemcolor', 'color', '.frame-list-item')
		.add('linkcolor', 'color', '.frame-list-item a')
		.add('fontsize', 'font-size', '*')
		.add('regionbg', 'background-color', '.frame-list-item-region')
		.add('regioncolor', 'color', '.frame-list-item-region');

	/** Invoke the add method on customizableProperties
	  *
	  * @param {String} key      - key to use in the URL
	  * @param {String} name     - name of the css-property to change
	  * @param {String} selector - html selector of which the css should change
	  */
	self.add = (key, name, selector) => {
		customizableProperties.add(key, name, selector);
		return self;
	};

	/** Read, check and add the given properties, then add them to the set of rules
	  *
	  * @param {Object} query - Query paramaters of route
	  */
	self.read = query => {
		customizableProperties.forEach(property => {
			const queryValue = query[property.key];
			let cssValue;
			if (typeof queryValue !== 'undefined') {
				// hexify color values
				if (property.name.indexOf('color') >= 0) {
					if (queryValue.match(/^[0-9A-F]+$/i)) {
						cssValue = '#' + queryValue.substr(0, 6);
					}
				} else {
					const intVal = parseInt(queryValue, 10);
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
