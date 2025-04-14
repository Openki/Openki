import { Meteor } from "meteor/meteor";

/**
 * Add a toJSON method if the object's prototype doesn't have one
 */
function extendPrototypeToJSON(o: { prototype: any }) {
  // http://stackoverflow.com/a/18391400/2652567
  if (!("toJSON" in o.prototype)) {
    Object.defineProperty(o.prototype, "toJSON", {
      value() {
        const alt: Record<string, string> = {};

        Object.getOwnPropertyNames(this).forEach((key) => {
          alt[key] = this[key];
        });

        return alt;
      },
      configurable: true,
      writable: true,
    });
  }
}

// This is useful in serializing errors to the Log
extendPrototypeToJSON(Error);
extendPrototypeToJSON(Meteor.Error);
