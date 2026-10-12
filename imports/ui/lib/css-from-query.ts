export class CssFromQuery {
  public customizableProperties: { key: string; name: string; selector: string }[] = [];
  #hexColorRegExp = /^[0-9A-F]+$/i;

  /**
   * @param properties the customizable properties to add
   */
  constructor(
    public query: Record<string, string | undefined>,
    properties: [key: string, name: string, selector: string][] = [],
  ) {
    // define a default set of customizable properties
    this.addCustomizableProperties([
      ["bgcolor", "background-color", "body"],
      ["color", "color", "body, i"],
      ["fontsize", "font-size", "*"],
      ["fontweight", "font-weight", "p"],
    ]);

    this.addCustomizableProperties(properties);
  }

  /**
   * Add customizable properties
   * @param properties the customizable properties to add
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
      if (queryValue !== undefined) {
        // hexify color values
        if (property.name.includes("color")) {
          if (this.#hexColorRegExp.test(queryValue)) {
            cssValue = `#${queryValue.substring(0, 8)}`;
          }
        } else if (property.name.includes("font-weight")) {
          const intVal = Number.parseInt(queryValue, 10);
          if (!Number.isNaN(intVal)) {
            cssValue = `${Math.max(0, Math.min(1000, intVal))}`;
          }
        } else {
          const intVal = Number.parseInt(queryValue, 10);
          if (!Number.isNaN(intVal)) {
            cssValue = `${Math.max(0, Math.min(1000, intVal))}px`;
          }
        }

        if (cssValue) {
          cssRules.push(`${property.selector} { ${property.name}: ${cssValue} !important; }`);
        }
      }
    });
    return cssRules;
  }
}
