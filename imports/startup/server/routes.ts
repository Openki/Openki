import { Meteor } from "meteor/meteor";
import { WebApp } from "meteor/webapp";
import { check } from "meteor/check";

import { StringEnum } from "/imports/utils/CustomChecks";
import {
  getUnsubscribeRedirectURL,
  notificationTypes,
  notificationUnsubscribeHandlers,
  unsubscribeApiEndpoint,
} from "./emails/unsubscribe-helpers";

// Server only routes

WebApp.handlers.get(unsubscribeApiEndpoint, async (req, res) => {
  const { token, notificationType } = req.params;
  check(notificationType, StringEnum(...notificationTypes));

  const unsubscribeHandler = notificationUnsubscribeHandlers[notificationType];
  if (!unsubscribeHandler) {
    throw new Meteor.Error(400, `Unsupported notification type: ${notificationType}`);
  }

  const accepted = await unsubscribeHandler(token);

  res.redirect(302, getUnsubscribeRedirectURL(notificationType, accepted));
});

if (Meteor.isDevelopment) {
  await import("./dev-routes");
}
