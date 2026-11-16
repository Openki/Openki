import { Blaze } from "meteor/blaze";
// @ts-expect-error This module does in fact exist, but not in Meteor's native TypeScript types. We can ignore it since we will remove Blaze anyway.
import { Template as MeteorTemplate } from "meteor/templating";

// This module is vendored code, based on `@types/meteor`:
// Source code: https://npmx.dev/package-code/@types/meteor/v/2.9.11/templating.d.ts
// License: MIT
//
// This module can be removed when we remove Blaze.
//
// oxlint-disable

export interface TemplateStatic<
  D = any,
  T = Blaze.TemplateInstance<D>,
> extends Blaze.TemplateStatic<D, T> {
  new (viewName?: string, renderFunction?: Function): Blaze.Template;
  body: Blaze.Template;
}

/**
 * A helper type to make the access to data and template instance member type safe.
 * @example
 * const TemplateTyped = Template as TemplateStaticTyped<
 *     'newTemplate',
 *     { foo: string },
 *     {
 *         state: ReactiveDict<{ bar: number }>;
 *         getFooBar(): string;
 *     }
 * >;
 * TemplateTyped.newTemplate.onCreated(function () { ...
 * @template N Template name
 * @template D Data
 * @template T Template interface with custom properties and methods that extends the template instance
 */
export type TemplateStaticTyped<
  N extends string,
  D extends any = unknown,
  T extends Record<string, unknown> = Record<string, never>,
> = TemplateStatic<D, T & Blaze.TemplateInstance<D>> & {
  [key in N]: Blaze.Template<D, T & Blaze.TemplateInstance<D>>;
};

/**
 * Use this instead of importing `meteor/templating` to get better types.
 */
export const Template = MeteorTemplate as TemplateStatic & {
  [index: string]: any | Blaze.Template;
};

// Declare global for backwards-compatibility with `@meteor/types` to keep the diff as minimal as possible
declare global {
  var Template: TemplateStatic & {
    [index: string]: any | Blaze.Template;
  };
}
