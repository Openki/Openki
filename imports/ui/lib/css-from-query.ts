export class CssFromQuery {
	public customizableProperties: { key: string; name: string; selector: string }[] = [];

	/**
	 * @param properties the customizable properties to add
	 */
	constructor(
		public query: { [param: string]: string },
		properties: [key: string, name: string, selector: string][] = [],
	) {
		// define a default set of customizable properties
		this.addCustomizableProperties([
			['bgcolor', 'background-color', 'body'],
			['color', 'color', 'body'],
			['fontsize', 'font-size', '*'],
		]);

		this.addCustomizableProperties(properties);
	}

	/**
	 * Add customizable properties
	 * @param  properties the customizable properties to add
	 */
	addCustomizableProperties(properties: [key: string, name: string, selector: string][]) {
		properties.forEach((property) => {
			const [key, name, selector] = property;
			this.customizableProperties.push({ key, name, selector });
		});
		return this;
	}

	getCssRules() {
		const cssRules: string[] = [];
		this.customizableProperties.forEach((property) => {
			const queryValue = this.query[property.key];
			let cssValue;
			if (typeof queryValue !== 'undefined') {
				// hexify color values
				if (property.name.includes('color')) {
					if (queryValue.match(/^[0-9A-F]+$/i)) {
						cssValue = `#${queryValue.substr(0, 8)}`;
					}
				} else {
					const intVal = parseInt(queryValue, 10);
					if (!Number.isNaN(intVal)) {
						cssValue = `${Math.max(0, Math.min(1000, intVal))}px`;
					}
				}

				if (cssValue) {
					cssRules.push(`${property.selector} { ${property.name}: ${cssValue}; }`);
				}
			}
		});
		return cssRules;
	}
}

export default CssFromQuery;
