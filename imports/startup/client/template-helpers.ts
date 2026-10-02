import { Template } from "meteor/templating";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { buildCssVariableColor } from "/imports/utils/getColor";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const helpers: Record<string, Function> = {
  PublicSettings() {
    return PublicSettings;
  },

  buildCssVariableColor(name: string, value: string) {
    return buildCssVariableColor(name, value);
  },
};
Object.entries(helpers).forEach(([name, helper]) => Template.registerHelper(name, helper));

/** Utility to simplify the map of a Blaze component to a React component for backwards compatibility. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Template.registerHelper("component", function (this: any, f: any) {
  const self = { ...this };
  self.component = f;
  return self;
});
