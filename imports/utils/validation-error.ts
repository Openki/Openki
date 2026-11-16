import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

/**
 * The "details" property of the ValidationError must be an array of objects
 * containing at least two properties. The "name" and "type" properties are
 * required.
 */
const errorsPattern: [
  Match.Matcher<{
    name: string;
    type: string;
  }>,
] = [
  Match.ObjectIncluding({
    name: String,
    type: String,
  }),
];

export interface ValidationErrorDetail {
  name: string;
  type: string;
  [name: string]: any;
}

/**
 * Use a validation error to indicate that a method call has failed
 * and the client can fix it by changing specific arguments.
 *
 * Examples:
 *
 * 1. An argument isn't of the right type
 *  2. A number argument isn't in the right range
 *  3. A username wasn't found in the database
 *
 * This kind of error is tied to a specific field so that you can
 * display it next to an input in a form currently being filled by the user.
 *
 * Learn more: https://github.com/meteor/validation-error
 * ---
 *
 * **Source code** based on The Meteor Atmosphere package `mdg:validation-error`:
 * Git: https://github.com/meteor/validation-error
 * License: MIT
 *
 * **Types** based on `@types/meteor-mdg-validation-error`:
 * Git: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/meteor-mdg-validation-error
 * License: MIT
 */
export class ValidationError extends Meteor.Error {
  /**
   * @param errors The "details" property of the ValidationError must be an array of objects containing at least two properties. The "name" and "type" properties are required.
   */
  constructor(errors: ValidationErrorDetail[], message = ValidationError.DEFAULT_MESSAGE) {
    check(errors, errorsPattern);
    check(message, String);

    // @ts-expect-error Not sure how to fix this, but we preserve the runtime behavior of the original library.
    return super(ValidationError.ERROR_CODE, message, errors);
  }

  /** Static method checking if a given Meteor.Error is an instance of ValidationError. */
  static is(err: unknown): err is ValidationError {
    return err instanceof Meteor.Error && err.error === ValidationError.ERROR_CODE;
  }

  /**  Universal validation error code to be use in applications and packages. */
  static ERROR_CODE = "validation-error";
  /**  Default validation error message that can be changed globally. */
  static DEFAULT_MESSAGE = "Validation failed";
}
