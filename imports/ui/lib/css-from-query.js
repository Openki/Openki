export default class CssFromQuery {
	constructor(query) {
		this.query = query;
		this.customizableProperties = [];

		// define a default set of customizable properties
		this.addCustomizableProperties([
			['bgcolor', 'background-color', 'body'],
			['color', 'color', 'body'],
			['itembg', 'background-color', '.frame-list-item'],
			['itemcolor', 'color', '.frame-list-item'],
			['linkcolor', 'color', '.frame-list-item a'],
			['fontsize', 'font-size', '*'],
			['regionbg', 'background-color', '.frame-list-item-region'],
			['regioncolor', 'color', '.frame-list-item-region']
		]);
	}

	/** Add customizable properties
	  *
	  * @param  {Array} properties - the customizable properties to add
	  * @return {CssFromQuery Object}
	  */
	addCustomizableProperties(properties) {
		properties.forEach(property => {
			const [key, name, selector] = property;
			this.customizableProperties.push({ key, name, selector });
		});
		return this;
	}

	getCssRules() {
		this.cssRules = [];
		this.customizableProperties.forEach(property => {
			const queryValue = this.query[property.key];
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
					this.cssRules.push(
						`${property.selector} { ${property.name}: ${cssValue}; }`
					);
				}
			}
		});

		return this.cssRules;
	}
}
