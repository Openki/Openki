import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Blaze } from "meteor/blaze";

/**
 * Handle action that need a logged in user
 * @param instance the template instance
 * @param afterLogin the save method
 */
export function PleaseLogin(
  instance: Blaze.TemplateInstance,
  afterLogin: () => void,
  visitorUserAllowed = false,
) {
  let openedLogin = false;

  instance.autorun((computation) => {
    if (Meteor.userId()) {
      // if the user is loggged in stop the computation and call the save function

      computation.stop();
      afterLogin();
    } else if (Session.equals("pleaseLogin", false) && openedLogin) {
      // also stop the computation but don't save if the user closes the login
      // window without logging in

      computation.stop();
      instance.busy(false);
    } else {
      // if the user is not logged in open up the login window

      Session.set("visitorUserAllowed", visitorUserAllowed);
      Session.set("pleaseLogin", true);
      openedLogin = true;
    }
  });
}
