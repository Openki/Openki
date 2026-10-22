import { Template } from "meteor/templating";

import { PublicSettings } from "/imports/utils/PublicSettings";
import { buildCssVariableColor } from "/imports/utils/getColor";

const helpers: {
  PublicSettings(): typeof PublicSettings;
  buildCssVariableColor(name: string, value: string): string;
} = {
  PublicSettings() {
    return PublicSettings;
  },
  buildCssVariableColor,
};
Object.entries(helpers).forEach(([name, helper]) => Template.registerHelper(name, helper));

/** Utility to simplify the map of a Blaze component to a React component for backwards compatibility. */
// oxlint-disable-next-line no-explicit-any
Template.registerHelper("component", function (this: any, f: any) {
  const self = { ...this };
  self.component = f;
  return self;
});
