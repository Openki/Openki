import { Session } from "meteor/session";
import { Random } from "meteor/random";
import { TemplateStaticTyped } from "meteor/templating";

/** Setup expand/collaps logic for a template
 *
 * This mixin extends the given template with an `expanded` helper and
 * two click handlers `js-expand` and `js-close`. Only one expandible template
 * can be open at a time, so don't nest them.
 *
 * @example
 * <template name="pushIt">
 *   <div>
 *     {{#if expanded}}
 *       All this content hiding here.
 *       Now close it again!
 *       <button type="button" class="js-collapse">CLOSE IT!</button>
 *     {{else}}
 *       Press the button!
 *       <button type="button" class="js-expand">OPEN IT!</button>
 *     {{/if}}
 *   </div>
 * </template>
 */
export function Expandible<N extends string, D, T extends Record<string, unknown>>(
  TemplateBase: TemplateStaticTyped<N, D, T>,
  templateName: N,
) {
  const Template = TemplateBase as TemplateStaticTyped<
    N,
    D,
    T & { _expander: string; expanded: () => void; collapse: () => void }
  >;

  const template = Template[templateName];

  template.onCreated(function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    const expander = Random.id(); // Token to keep track of which Expandible is open
    instance._expander = expander; // Read by event handlers
    instance.expanded = () => {
      return Session.equals("verify", instance._expander);
    };
    instance.collapse = () => {
      if (Session.equals("verify", expander)) {
        Session.set("verify", false);
      }
    };
  });
  template.helpers({
    expanded() {
      return Template.instance().expanded();
    },
  });
  template.events({
    "click .js-expand"(event, instance) {
      event.stopPropagation();
      Session.set("verify", instance._expander);
    },
    "click .js-collapse"() {
      Session.set("verify", false);
    },
  });

  return Template;
}
