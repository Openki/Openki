import { Blaze } from "meteor/blaze";

/**
 * Give a preview of a filter by highlighting the matching groups
 */

export function FilterPreview(options: {
  /** property to filter for (e.g. category, region) */
  property: string;
  /** id/name of the property */
  id: string;
  /** de-/activate the preview effect */
  activate: boolean;
  /** delay the fade effect */
  delayed?: boolean;
  /** instance object for scoping */
  instance?: Blaze.TemplateInstance;
}) {
  const instance = options.instance || false;
  const group = instance ? instance.$(".course-compact") : $(".course-compact");
  const { property } = options;

  // build selector class
  let selector;

  if (property === "state") {
    selector = options.id;
  } else if (property === "role") {
    selector = `needs-role-${options.id}`;
  } else {
    selector = `${property}-${options.id}`;
  }

  selector = `.${selector}`;

  // create class for groups which are to be faded out and
  // add a suffix if the fading effect is delayed
  let fadeClass = "filter-no-match";
  if (options.delayed) {
    fadeClass += "-delayed";
  }

  // fade out the groups which don't match the selector
  group.not(selector).toggleClass(fadeClass, options.activate);

  // for properties which have labels used on the groups,
  // highlight the labels too
  if (property === "category" || property === "organization") {
    const labelClass = `.js-${property}-label${selector}`;
    const label = instance ? instance.$(labelClass) : $(labelClass);

    label.parent().toggleClass("highlight");
  }
}
